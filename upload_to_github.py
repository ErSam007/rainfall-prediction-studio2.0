"""
Automated GitHub Repository Creator and Project Uploader for Rainfall Prediction.
Works in two modes:
1. GitHub CLI (gh) if authenticated
2. Direct GitHub REST / Git Trees API (using a GitHub Personal Access Token) - no Git.exe required!
"""

import os
import sys
import json
import base64
import urllib.request
import urllib.error
import subprocess

REPO_NAME = "rainfall-prediction-studio"
REPO_DESC = "Machine Learning Rainfall Prediction & Meteorological AI with Indian Dataset & MongoDB"
PROJECT_DIR = os.path.abspath(os.path.dirname(__file__))

IGNORE_DIRS = {
    'node_modules', '.git', '__pycache__', 'venv', 'env', '.venv',
    '.system_generated', '.idea', '.vscode'
}

IGNORE_FILES = {
    '.DS_Store', 'Thumbs.db', 'desktop.ini'
}

def check_gh_cli():
    gh_path = r"C:\Program Files\GitHub CLI\gh.exe"
    if not os.path.exists(gh_path):
        gh_path = "gh"
    try:
        res = subprocess.run([gh_path, "auth", "status"], capture_output=True, text=True)
        if "Logged in to" in res.stdout or "Logged in to" in res.stderr:
            return gh_path
    except Exception:
        pass
    return None

def upload_via_gh(gh_cmd):
    print(f"\n[INFO] Found active GitHub CLI session: {gh_cmd}")
    print(f"[INFO] Creating public repository '{REPO_NAME}'...")
    try:
        # Create repo
        create_res = subprocess.run(
            [gh_cmd, "repo", "create", REPO_NAME, "--public", "--description", REPO_DESC],
            capture_output=True, text=True
        )
        print(create_res.stdout)
        print(create_res.stderr)
    except Exception as e:
        print(f"[WARN] Create repo step: {e}")

def get_all_project_files():
    file_list = []
    for root, dirs, files in os.walk(PROJECT_DIR):
        # Filter out ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if f in IGNORE_FILES or f.endswith('.pyc') or f.endswith('.log'):
                continue
            abs_path = os.path.join(root, f)
            rel_path = os.path.relpath(abs_path, PROJECT_DIR).replace('\\', '/')
            # Skip if larger than 25MB for direct REST API
            size = os.path.getsize(abs_path)
            if size > 25 * 1024 * 1024:
                continue
            file_list.append((rel_path, abs_path))
    return file_list

def upload_via_github_api(token):
    headers = {
        "Authorization": f"Bearer {token.strip()}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Rainfall-Prediction-Deployer"
    }

    # 1. Get authenticated user
    print("\n[1/5] Verifying GitHub Token...")
    req = urllib.request.Request("https://api.github.com/user", headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            user_data = json.loads(resp.read().decode('utf-8'))
            username = user_data.get("login")
            print(f"       Authenticated as: @{username} ({user_data.get('name', '')})")
    except urllib.error.HTTPError as e:
        print(f"[ERROR] Invalid GitHub Token (HTTP {e.code}): {e.read().decode('utf-8')}")
        return

    # 2. Create or verify repository
    print(f"\n[2/5] Creating GitHub repository '{REPO_NAME}'...")
    create_payload = json.dumps({
        "name": REPO_NAME,
        "description": REPO_DESC,
        "private": False,
        "auto_init": True
    }).encode('utf-8')

    repo_url = f"https://api.github.com/repos/{username}/{REPO_NAME}"
    try:
        req = urllib.request.Request("https://api.github.com/user/repos", data=create_payload, headers=headers)
        with urllib.request.urlopen(req) as resp:
            repo_data = json.loads(resp.read().decode('utf-8'))
            print(f"       Created repository: {repo_data.get('html_url')}")
    except urllib.error.HTTPError as e:
        if e.code == 422:
            print(f"       Repository '{REPO_NAME}' already exists, uploading files into it...")
        else:
            print(f"[ERROR] Could not create repository: {e.read().decode('utf-8')}")
            return

    # 3. Gather project files
    print("\n[3/5] Indexing local project files...")
    files = get_all_project_files()
    print(f"       Found {len(files)} files to upload.")

    # 4. Upload blobs and build tree
    print("\n[4/5] Uploading project files to GitHub...")
    tree_items = []
    for idx, (rel_path, abs_path) in enumerate(files):
        try:
            with open(abs_path, 'rb') as f:
                content_bytes = f.read()

            try:
                # Try UTF-8 string
                content_str = content_bytes.decode('utf-8')
                blob_payload = json.dumps({
                    "content": content_str,
                    "encoding": "utf-8"
                }).encode('utf-8')
            except UnicodeDecodeError:
                # Binary file (images, joblib models) -> base64
                content_b64 = base64.b64encode(content_bytes).decode('ascii')
                blob_payload = json.dumps({
                    "content": content_b64,
                    "encoding": "base64"
                }).encode('utf-8')

            blob_req = urllib.request.Request(
                f"{repo_url}/git/blobs",
                data=blob_payload,
                headers=headers
            )
            with urllib.request.urlopen(blob_req) as b_resp:
                b_data = json.loads(b_resp.read().decode('utf-8'))
                tree_items.append({
                    "path": rel_path,
                    "mode": "100644",
                    "type": "blob",
                    "sha": b_data["sha"]
                })
            
            if (idx + 1) % 10 == 0 or idx == len(files) - 1:
                print(f"       Uploaded {idx + 1}/{len(files)} files...")
        except Exception as err:
            print(f"       [WARN] Skipping {rel_path}: {err}")

    # 5. Create Git Tree and Commit
    print("\n[5/5] Finalizing Git Commit & Updating Branch...")
    tree_payload = json.dumps({"tree": tree_items}).encode('utf-8')
    tree_req = urllib.request.Request(f"{repo_url}/git/trees", data=tree_payload, headers=headers)
    with urllib.request.urlopen(tree_req) as t_resp:
        new_tree_sha = json.loads(t_resp.read().decode('utf-8'))["sha"]

    # Get latest commit sha for parent
    ref_req = urllib.request.Request(f"{repo_url}/git/refs/heads/main", headers=headers)
    parent_sha = None
    try:
        with urllib.request.urlopen(ref_req) as r_resp:
            parent_sha = json.loads(r_resp.read().decode('utf-8'))["object"]["sha"]
    except Exception:
        pass

    commit_payload = {
        "message": "Initial release: Rainfall Prediction & Meteorological AI Studio with MongoDB",
        "tree": new_tree_sha
    }
    if parent_sha:
        commit_payload["parents"] = [parent_sha]

    commit_req = urllib.request.Request(
        f"{repo_url}/git/commits",
        data=json.dumps(commit_payload).encode('utf-8'),
        headers=headers
    )
    with urllib.request.urlopen(commit_req) as c_resp:
        new_commit_sha = json.loads(c_resp.read().decode('utf-8'))["sha"]

    # Update ref
    ref_update_payload = json.dumps({"sha": new_commit_sha, "force": True}).encode('utf-8')
    try:
        update_req = urllib.request.Request(
            f"{repo_url}/git/refs/heads/main",
            data=ref_update_payload,
            headers=headers
        )
        with urllib.request.urlopen(update_req) as u_resp:
            pass
    except Exception:
        # Create ref if didn't exist
        create_ref_payload = json.dumps({"ref": "refs/heads/main", "sha": new_commit_sha}).encode('utf-8')
        create_ref_req = urllib.request.Request(
            f"{repo_url}/git/refs",
            data=create_ref_payload,
            headers=headers
        )
        with urllib.request.urlopen(create_ref_req) as cr_resp:
            pass

    repo_html = f"https://github.com/{username}/{REPO_NAME}"
    print("\n" + "=" * 60)
    print(f"🎉 SUCCESS! Project uploaded to GitHub:")
    print(f"👉 {repo_html}")
    print("=" * 60)
    return repo_html

def main():
    print("=" * 60)
    print("Rainfall Prediction Studio - GitHub Uploader")
    print("=" * 60)

    token = os.environ.get("GITHUB_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1]

    if not token:
        print("\nTo upload to GitHub without needing Git.exe installed:")
        print("1. Go to: https://github.com/settings/tokens?type=beta (or Settings -> Developer settings -> Personal access tokens)")
        print("2. Generate a token with 'repo' scope.")
        print("3. Paste the token below.\n")
        try:
            token = input("Enter your GitHub Personal Access Token (PAT): ").strip()
        except EOFError:
            print("[INFO] No input received. Run with: python upload_to_github.py <YOUR_GITHUB_TOKEN>")
            return

    if token:
        upload_via_github_api(token)
    else:
        print("[ERROR] Token was empty. Aborting.")

if __name__ == "__main__":
    main()


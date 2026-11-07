import os
import shutil
import sys
import urllib.request
import zipfile
from pathlib import Path


MODEL_RELEASE_URL = os.environ.get("MODEL_RELEASE_URL")
MODEL_GITHUB_TOKEN = os.environ.get("MODEL_GITHUB_TOKEN")
ROOT_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = ROOT_DIR / "backend" / "models"
ARCHIVE_PATH = ROOT_DIR / "fairscore-models.zip"

REQUIRED_FILES = (
    "random_forest_model.joblib",
    "lightgbm_model.joblib",
    "meta_learner.joblib",
    "label_encoders.joblib",
    "scaler.joblib",
)


def download_archive() -> None:
    if not MODEL_RELEASE_URL:
        raise RuntimeError("MODEL_RELEASE_URL is not configured")
    if not MODEL_GITHUB_TOKEN:
        raise RuntimeError("MODEL_GITHUB_TOKEN is not configured")

    request = urllib.request.Request(
        MODEL_RELEASE_URL,
        headers={
            "Accept": "application/octet-stream",
            "Authorization": f"Bearer {MODEL_GITHUB_TOKEN}",
            "X-GitHub-Api-Version": "2022-11-28",
        },
    )

    print("Downloading private model archive...")
    with urllib.request.urlopen(request, timeout=600) as response:
        with ARCHIVE_PATH.open("wb") as archive:
            shutil.copyfileobj(response, archive)


def extract_and_validate() -> None:
    if not ARCHIVE_PATH.exists() or ARCHIVE_PATH.stat().st_size == 0:
        raise RuntimeError("Downloaded model archive is missing or empty")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ARCHIVE_PATH) as archive:
        members = {Path(name).name: name for name in archive.namelist()}
        names = set(members)
        missing = [filename for filename in REQUIRED_FILES if filename not in names]
        if missing:
            raise RuntimeError(f"Model archive is missing: {', '.join(missing)}")
        for filename in REQUIRED_FILES:
            with archive.open(members[filename]) as source:
                with (MODELS_DIR / filename).open("wb") as target:
                    shutil.copyfileobj(source, target)

    for filename in REQUIRED_FILES:
        path = MODELS_DIR / filename
        if not path.exists() or path.stat().st_size == 0:
            raise RuntimeError(f"Model file was not extracted: {filename}")


def main() -> None:
    try:
        download_archive()
        extract_and_validate()
        print("All model files downloaded successfully.")
    finally:
        ARCHIVE_PATH.unlink(missing_ok=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        raise

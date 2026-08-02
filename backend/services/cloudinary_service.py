import io
import inspect
import os
import re
import uuid
from typing import BinaryIO
from fastapi import HTTPException, UploadFile, status

import cloudinary
import cloudinary.uploader
from config import CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME

# Allowed image & video extensions
ALLOWED_PHOTO_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_PHOTO_MIME_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".webm"}
ALLOWED_VIDEO_MIME_TYPES = {"video/mp4", "video/quicktime", "video/mov", "video/webm"}

# Forbidden executable / dangerous extensions
EXECUTABLE_EXTENSIONS = {
    ".exe", ".bat", ".cmd", ".sh", ".php", ".js", ".py", ".pl", ".cgi",
    ".dll", ".so", ".dmg", ".iso", ".msi", ".jar", ".app", ".vbs", ".ps1"
}

# Maximum allowed file sizes
MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024    # 10 MB
MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024  # 100 MB


def init_cloudinary():
    """Configure Cloudinary with environment variables."""
    cloudinary.config(
        cloud_name=CLOUDINARY_CLOUD_NAME,
        api_key=CLOUDINARY_API_KEY,
        api_secret=CLOUDINARY_API_SECRET,
        secure=True,
    )


def sanitize_filename(filename: str | None) -> str:
    if not filename:
        return "file"
    filename = os.path.basename(filename)
    return re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)


def validate_image(content: bytes, filename: str | None = None, content_type: str | None = None):
    """File validation for format, size (10MB max), and executable signatures."""
    if len(content) > MAX_PHOTO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Photo size exceeds maximum limit of 10 MB ({len(content) / (1024 * 1024):.2f} MB)",
        )

    if filename:
        clean_name = sanitize_filename(filename)
        ext = os.path.splitext(clean_name)[1].lower()
        if ext in EXECUTABLE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Executable file types ({ext}) are strictly forbidden",
            )
        if ext not in ALLOWED_PHOTO_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported photo format '{ext}'. Allowed formats: JPG, JPEG, PNG, WEBP",
            )

    if content_type and content_type.lower() not in ALLOWED_PHOTO_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{content_type}'. Must be a valid image (JPEG, PNG, WEBP)",
        )

    is_jpeg = content.startswith(b"\xff\xd8\xff")
    is_png = content.startswith(b"\x89PNG")
    is_webp = content.startswith(b"RIFF") and b"WEBP" in content[:16]

    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded photo header is not a valid image byte stream",
        )


def validate_video(content: bytes, filename: str | None = None, content_type: str | None = None):
    """File validation for video format, size (100MB max), and executable signatures."""
    if len(content) > MAX_VIDEO_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Video size exceeds maximum limit of 100 MB ({len(content) / (1024 * 1024):.2f} MB)",
        )

    if filename:
        clean_name = sanitize_filename(filename)
        ext = os.path.splitext(clean_name)[1].lower()
        if ext in EXECUTABLE_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Executable file types ({ext}) are strictly forbidden",
            )
        if ext not in ALLOWED_VIDEO_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported video format '{ext}'. Allowed formats: MP4, MOV, WEBM",
            )

    if content_type and content_type.lower() not in ALLOWED_VIDEO_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid MIME type '{content_type}'. Must be a valid video (MP4, MOV, WEBM)",
        )


def extract_public_id(url: str | None) -> str | None:
    """Extract public_id from a Cloudinary secure_url."""
    if not url or "res.cloudinary.com" not in url:
        return None

    try:
        match = re.search(r"/upload/(?:v\d+/)?(.*?)(?:\.[a-zA-Z]+)?$", url)
        if match:
            return match.group(1)
    except Exception:
        pass
    return None


async def upload_image(
    file_input: bytes | UploadFile | BinaryIO,
    filename: str | None = None,
    folder: str = "geotrack_hrms",
) -> dict:
    """
    Upload image to Cloudinary with automatic optimization.
    Returns dict with 'secure_url' and 'public_id'.
    """
    init_cloudinary()

    content: bytes = b""
    content_type: str | None = None

    if isinstance(file_input, UploadFile):
        filename = filename or file_input.filename
        content_type = file_input.content_type
        content = await file_input.read()
    elif isinstance(file_input, bytes):
        content = file_input
    elif hasattr(file_input, "read"):
        res = file_input.read()
        if inspect.iscoroutine(res):
            content = await res
        else:
            content = res

    validate_image(content, filename=filename, content_type=content_type)

    ext = (os.path.splitext(filename)[1].lower() if filename else ".jpg") or ".jpg"
    unique_id = uuid.uuid4().hex[:12]
    public_id = f"{folder}/{unique_id}"

    try:
        response = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            folder=None,
            overwrite=True,
            resource_type="image",
            quality="auto",
            fetch_format="auto",
        )
        if not response or not response.get("secure_url"):
            raise Exception("Cloudinary returned empty response")
        return {
            "secure_url": response.get("secure_url"),
            "public_id": response.get("public_id"),
        }
    except Exception as e:
        raise Exception(f"Cloudinary upload failed: {str(e)}")


async def upload_video(
    file_input: bytes | UploadFile | BinaryIO,
    filename: str | None = None,
    folder: str = "geotrack_hrms/videos",
) -> dict:
    """
    Upload video to Cloudinary.
    Returns dict with 'secure_url' and 'public_id'.
    """
    init_cloudinary()

    content: bytes = b""
    content_type: str | None = None

    if isinstance(file_input, UploadFile):
        filename = filename or file_input.filename
        content_type = file_input.content_type
        content = await file_input.read()
    elif isinstance(file_input, bytes):
        content = file_input
    elif hasattr(file_input, "read"):
        res = file_input.read()
        if inspect.iscoroutine(res):
            content = await res
        else:
            content = res

    validate_video(content, filename=filename, content_type=content_type)

    ext = (os.path.splitext(filename)[1].lower() if filename else ".mp4") or ".mp4"
    unique_id = uuid.uuid4().hex[:12]
    public_id = f"{folder}/{unique_id}"

    try:
        response = cloudinary.uploader.upload(
            content,
            public_id=public_id,
            folder=None,
            overwrite=True,
            resource_type="video",
        )
        if not response or not response.get("secure_url"):
            raise Exception("Cloudinary returned empty response")
        return {
            "secure_url": response.get("secure_url"),
            "public_id": response.get("public_id"),
        }
    except Exception as e:
        raise Exception(f"Cloudinary video upload failed: {str(e)}")


def delete_image(public_id: str | None) -> bool:
    """Delete an image or video from Cloudinary by public_id."""
    if not public_id:
        return False

    init_cloudinary()
    try:
        res = cloudinary.uploader.destroy(public_id, invalidate=True)
        return res.get("result") == "ok"
    except Exception:
        return False


def save_local_file(content: bytes, filename: str | None, folder: str) -> str:
    """Save binary file to uploads directory on local disk."""
    subfolder = folder.replace("geotrack_hrms/", "").strip("/")
    target_dir = os.path.join("uploads", subfolder)
    os.makedirs(target_dir, exist_ok=True)

    clean_name = sanitize_filename(filename or "file")
    ext = os.path.splitext(clean_name)[1].lower()
    if not ext:
        ext = ".jpg"

    unique_filename = f"{uuid.uuid4().hex[:10]}_{clean_name}"
    file_path = os.path.join(target_dir, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    rel_path = f"/uploads/{subfolder}/{unique_filename}".replace("\\", "/")
    return rel_path


async def process_media_upload(
    file_input: UploadFile | bytes | None,
    folder: str = "geotrack_hrms/media",
    resource_type: str = "image",
) -> str | None:
    """
    Safely reads media file bytes once, attempts Cloudinary upload if valid credentials exist,
    and falls back seamlessly to local disk file storage inside uploads/.
    """
    if not file_input:
        return None

    content: bytes = b""
    filename: str | None = None
    content_type: str | None = None

    if isinstance(file_input, UploadFile):
        filename = file_input.filename
        content_type = file_input.content_type
        content = await file_input.read()
    elif isinstance(file_input, bytes):
        content = file_input

    if not content or len(content) == 0:
        return None

    # Check if Cloudinary is configured with valid production/dev credentials (not dummy keys)
    is_cloudinary_configured = bool(
        CLOUDINARY_CLOUD_NAME
        and CLOUDINARY_CLOUD_NAME != "geotrack_demo"
        and CLOUDINARY_API_KEY
        and CLOUDINARY_API_KEY != "123456789012345"
    )

    if is_cloudinary_configured:
        try:
            if resource_type == "video":
                res = await upload_video(content, filename=filename, folder=folder)
            else:
                res = await upload_image(content, filename=filename, folder=folder)
            if res and res.get("secure_url"):
                return res.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload warning: {e}. Storing media file locally...")

    # Fallback to saving file locally on server disk under uploads/
    return save_local_file(content, filename=filename, folder=folder)


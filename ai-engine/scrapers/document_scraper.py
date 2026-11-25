import logging
import os
import tempfile
from typing import Any, Dict

logger = logging.getLogger(__name__)


def parse_document(file_bytes: bytes, filename: str) -> Dict[str, Any]:
    """
    Uses the unstructured library to detect and extract text from uploaded
    documents such as PDFs, DOCX, XLSX, and TXT files in a production-safe way.
    """
    try:
        ext = os.path.splitext(filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            tmp_file.write(file_bytes)
            tmp_path = tmp_file.name

        try:
            from unstructured.partition.auto import partition

            elements = partition(filename=tmp_path, strategy="auto")
            clean_text = "\n\n".join(str(el) for el in elements if str(el).strip())
            return {
                "status": "success",
                "type": "document",
                "title": filename,
                "author": "Extracted from Document",
                "content": clean_text[:50000],
                "filename": filename,
                "metadata": {
                    "source": "unstructured",
                    "content_length": len(clean_text),
                },
            }
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    except Exception as exc:
        logger.exception("Document parsing failed for %s", filename)
        return {
            "status": "error",
            "type": "document",
            "message": f"Document parsing failed: {exc}",
            "filename": filename,
        }

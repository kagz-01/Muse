from unstructured.partition.auto import partition
import tempfile
import os

def parse_document(file_bytes: bytes, filename: str) -> dict:
    """
    Uses the 'unstructured' library to automatically detect the file type 
    (PDF, DOCX, XLSX, TXT, etc.) and extract the pure text content.
    """
    try:
        # Unstructured often needs a file path to inspect extensions and use specific parsers.
        # We write the uploaded bytes to a temporary file.
        # Ensure we keep the extension so auto partition can hint from it.
        ext = os.path.splitext(filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp_file:
            tmp_file.write(file_bytes)
            tmp_path = tmp_file.name

        try:
            # Partition automatically detects format and extracts elements
            elements = partition(filename=tmp_path)
            
            # Join all text elements together
            clean_text = "\n\n".join([str(el) for el in elements if str(el).strip()])
            
            return {
                "status": "success",
                "type": "document",
                "title": filename,
                "author": "Extracted from Document",
                "content": clean_text[:50000], # Cap length to avoid massive overload
                "filename": filename
            }
        
        finally:
            # Clean up the temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    except Exception as e:
        return {
            "status": "error",
            "type": "document",
            "message": f"Document Parsing Failed: {str(e)}",
            "filename": filename
        }

import PyPDF2
import docx
from io import BytesIO
from typing import Tuple

class FileProcessor:
    @staticmethod
    def extract_from_pdf(file_bytes: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract PDF: {str(e)}")
    
    @staticmethod
    def extract_from_docx(file_bytes: bytes) -> str:
        """Extract text from DOCX"""
        try:
            doc = docx.Document(BytesIO(file_bytes))
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract DOCX: {str(e)}")
    
    @staticmethod
    def extract_from_txt(file_bytes: bytes) -> str:
        """Extract text from TXT"""
        try:
            return file_bytes.decode('utf-8', errors='ignore').strip()
        except Exception as e:
            raise ValueError(f"Failed to extract TXT: {str(e)}")
    
    @classmethod
    def extract_text(cls, file_bytes: bytes, file_type: str) -> Tuple[str, int]:
        """Extract text based on file type"""
        extractors = {
            '.pdf': cls.extract_from_pdf,
            '.docx': cls.extract_from_docx,
            '.doc': cls.extract_from_docx,
            '.txt': cls.extract_from_txt
        }
        
        extractor = extractors.get(file_type.lower())
        if not extractor:
            raise ValueError(f"Unsupported file type: {file_type}")
        
        text = extractor(file_bytes)
        word_count = len(text.split())
        
        return text, word_count

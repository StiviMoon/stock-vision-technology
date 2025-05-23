# chatbot/chunker.py

def chunk_text(text: str, max_length: int = 400) -> list:
    """
    Divide el texto en chunks de longitud máxima `max_length` (aproximado).
    """
    import textwrap
    return textwrap.wrap(text, max_length)

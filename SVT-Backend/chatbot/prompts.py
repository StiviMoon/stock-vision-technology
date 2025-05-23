def build_prompt(user_query: str, context: str) -> str:
    prompt_parts = []

    if context.strip():
        prompt_parts.append(f"### CONTEXTO\n{context.strip()}")

    prompt_parts.append(f"### PREGUNTA\n{user_query.strip()}")
    prompt_parts.append("### RESPUESTA")

    return "\n\n".join(prompt_parts)

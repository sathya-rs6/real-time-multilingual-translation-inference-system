from services.gemma_local import tokenizer, model
import torch


def translate_with_gemma(
    text: str,
    source_lang: str,
    target_lang: str,
) -> str:
    if source_lang == target_lang:
        return text

    messages = [
        {
            "role": "system",
            "content": (
                "You are a professional translation engine. "
                "Translate text accurately and concisely. "
                "Output ONLY the translated text. "
                "No explanations, no extra words."
            ),
        },
        {
            "role": "user",
            "content": f"Translate from {source_lang} to {target_lang}:\n{text}",
        },
    ]

    input_ids = tokenizer.apply_chat_template(
        messages,
        tokenize=True,
        return_tensors="pt",
    ).to(model.device)

    output_ids = model.generate(
        input_ids,
        max_new_tokens=128,
        do_sample=False,
        eos_token_id=tokenizer.eos_token_id,
    )

    decoded = tokenizer.decode(
        output_ids[0][input_ids.shape[-1]:],
        skip_special_tokens=True,
    )

    return decoded.strip()

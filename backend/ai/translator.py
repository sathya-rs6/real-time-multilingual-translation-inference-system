from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
import torch

MODEL_NAME = "facebook/nllb-200-distilled-600M"

device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"🔍 Loading {MODEL_NAME} on {device}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSeq2SeqLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16 if device == "cuda" else torch.float32,
).to(device)

model.eval()

# ✅ Frontend → NLLB language mapping
LANG_MAP = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "ta": "tam_Taml",
    "ml": "mal_Mlym",
    "te": "tel_Telu",
    "kn": "kan_Knda",
    "ja": "jpn_Jpan",
}


def translate(text: str, source_lang: str, target_lang: str) -> str:
    if source_lang == target_lang:
        return text

    src = LANG_MAP.get(source_lang, "eng_Latn")
    tgt = LANG_MAP.get(target_lang, "eng_Latn")

    tokenizer.src_lang = src

    inputs = tokenizer(
        text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512,
    ).to(device)

    with torch.no_grad():
        output = model.generate(
            **inputs,
            forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt),
            max_new_tokens=128,
        )

    translated = tokenizer.decode(output[0], skip_special_tokens=True)
    return translated.strip()

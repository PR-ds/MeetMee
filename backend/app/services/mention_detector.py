import re
import jellyfish
from typing import List, Tuple

class MentionDetector:
    DIRECT_ADDRESS_PREFIXES = [
        r"(?:hey|hi|hello|so|well|tell me|can you|could you|please)\s+",
        r"(?:what do you think|any thoughts|your turn|take it away)\s*,?\s*",
    ]

    def is_phonetic_match(self, spoken_word: str, target_name: str, threshold: float = 0.85) -> bool:
        """
        Compares spoken word with target name using Jaro-Winkler and Metaphone.
        """
        w1 = spoken_word.lower().strip()
        w2 = target_name.lower().strip()

        if w1 == w2:
            return True

        # Jaro-Winkler similarity
        similarity = jellyfish.jaro_winkler_similarity(w1, w2)
        if similarity >= threshold:
            return True

        # Metaphone phonetic check
        meta1 = jellyfish.metaphone(w1)
        meta2 = jellyfish.metaphone(w2)
        if meta1 and meta2 and meta1 == meta2:
            return True

        return False

    def detect_user_mention(self, text: str, user_name: str, aliases: List[str] = None) -> Tuple[bool, str]:
        """
        Detects if the user or any of their aliases is addressed in the spoken chunk.
        """
        if not text:
            return False, ""

        names_to_check = [user_name] + (aliases or [])
        words = re.findall(r"\b\w+\b", text)

        for word in words:
            for target in names_to_check:
                if self.is_phonetic_match(word, target):
                    return True, target

        return False, ""

    def is_mentor_question(self, text: str, is_mentor_speaker: bool = False) -> bool:
        """
        Determines whether the given phrase constitutes a direct question.
        """
        text_clean = text.strip()
        if "?" in text_clean:
            return True

        question_openers = [
            "what", "why", "how", "when", "where", "who", "which",
            "can you", "could you", "would you", "is there", "are we",
            "do you know", "have we"
        ]
        text_lower = text_clean.lower()
        for opener in question_openers:
            if text_lower.startswith(opener):
                return True

        return False

mention_detector = MentionDetector()

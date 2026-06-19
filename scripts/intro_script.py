"""Shared narration script for the Intro Presenter.

Imported by both voice generators:
  - gen-intro-voice.py   (NVIDIA Magpie TTS — primary)
  - gen-intro-audio.py   (edge-tts — free fallback)

TTS text may use spelling hints (e.g. "I-V-R"); CAPTIONS are clean display text.
Steps: greeting (hero) -> about -> work -> skills -> contact.
"""

GREETINGS = {
    "morning": "Good morning, and thanks for picking up. I'm Vaibhav, "
               "a Genesys Cloud I-V-R developer based in Richardson, Texas. "
               "Welcome to my workspace. Let me walk you through what I do.",
    "afternoon": "Good afternoon, and thanks for picking up. I'm Vaibhav, "
                 "a Genesys Cloud I-V-R developer based in Richardson, Texas. "
                 "Welcome to my workspace. Let me walk you through what I do.",
    "evening": "Good evening, and thanks for taking my call. I'm Vaibhav, "
               "a Genesys Cloud I-V-R developer based in Richardson, Texas. "
               "Welcome to my workspace. Let me walk you through what I do.",
}

SEGMENTS = [
    {
        "id": "about",
        "section": "about",
        "text": "For seven plus years at Infosys, I've designed enterprise "
                "contact center solutions that handle millions of calls for "
                "healthcare and e-commerce clients, building I-V-R and bot flows "
                "in Genesys Architect and A-I Studio.",
    },
    {
        "id": "work",
        "section": "work",
        "text": "Here are a few projects I'm proud of. A cloud contact center "
                "modernization with OpenAI powered journeys, a full Genesys "
                "configuration tool, and omnichannel voice bots on Dialogflow "
                "and Cisco.",
    },
    {
        "id": "skills",
        "section": "skills",
        "text": "My toolkit spans the Genesys platform, A-I services like Azure "
                "Speech and OpenAI, and solid engineering in Java, Python, and "
                "React, backed by ten certifications and an I-o-T patent.",
    },
    {
        "id": "contact",
        "section": "contact",
        "text": "If this fits what you're building, let's talk. Press the "
                "contact option, or just stay on the line. Thanks for connecting.",
    },
]

CAPTIONS = {
    "morning": "Good morning, and thanks for picking up. I'm Vaibhav, a Genesys "
               "Cloud IVR developer based in Richardson, Texas. Welcome to my "
               "workspace — let me walk you through what I do.",
    "afternoon": "Good afternoon, and thanks for picking up. I'm Vaibhav, a Genesys "
                 "Cloud IVR developer based in Richardson, Texas. Welcome to my "
                 "workspace — let me walk you through what I do.",
    "evening": "Good evening, and thanks for taking my call. I'm Vaibhav, a Genesys "
               "Cloud IVR developer based in Richardson, Texas. Welcome to my "
               "workspace — let me walk you through what I do.",
    "about": "For 7+ years at Infosys I've designed enterprise contact-center "
             "solutions handling millions of calls for healthcare and e-commerce "
             "clients — IVR and bot flows in Genesys Architect and AI Studio.",
    "work": "Projects I'm proud of: a cloud contact-center modernization with "
            "OpenAI-powered journeys, a full Genesys configuration tool, and "
            "omnichannel voice bots on Dialogflow and Cisco.",
    "skills": "My toolkit spans the Genesys platform, AI services like Azure Speech "
              "and OpenAI, and engineering in Java, Python, and React — backed by "
              "10 certifications and an IoT patent.",
    "contact": "If this fits what you're building, let's talk. Press the contact "
               "option, or just stay on the line. Thanks for connecting.",
}

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Utility: generate realistic fake tx hash
function generateTxHash() {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Utility: seeded random based on sessionId
function seededRandom(seed) {
  let x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Utility: generate score for a given session number (1-indexed)
function generateSessionScores(sessionNum) {
  let base;
  if (sessionNum <= 10) {
    base = 75 + seededRandom(sessionNum * 7) * 15;
  } else if (sessionNum <= 20) {
    base = 68 + seededRandom(sessionNum * 7) * 14;
  } else {
    base = 58 + seededRandom(sessionNum * 7) * 16;
  }

  const noise = (seededRandom(sessionNum * 13) - 0.5) * 16;
  const mindScore = Math.max(30, Math.min(100, base + noise));

  return {
    wordFindingSpeed: Math.round(Math.max(30, Math.min(100, mindScore + (seededRandom(sessionNum * 2) - 0.5) * 16))),
    vocabularyDiversity: Math.round(Math.max(30, Math.min(100, mindScore + (seededRandom(sessionNum * 3) - 0.5) * 16))),
    sentenceComplexity: Math.round(Math.max(30, Math.min(100, mindScore + (seededRandom(sessionNum * 4) - 0.5) * 16))),
    semanticCoherence: Math.round(Math.max(30, Math.min(100, mindScore + (seededRandom(sessionNum * 5) - 0.5) * 16))),
    phonemicFluency: Math.round(Math.max(30, Math.min(100, mindScore + (seededRandom(sessionNum * 6) - 0.5) * 16))),
    mindScore: parseFloat(mindScore.toFixed(1)),
  };
}

// Generate 28 mock sessions
function generateSessions() {
  const sessions = [];
  const now = new Date('2026-06-21T00:00:00Z');
  const prompts = [
    "Tell me about something that made you happy this week.",
    "Describe your morning routine in detail.",
    "What's a childhood memory you think about often?",
    "Explain how you would cook your favorite meal.",
    "Describe a place you love to visit.",
  ];

  for (let i = 1; i <= 28; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (28 - i));
    const scores = generateSessionScores(i);
    const prevScores = i > 1 ? generateSessionScores(i - 1) : null;
    const trend = prevScores ? parseFloat((scores.mindScore - prevScores.mindScore).toFixed(1)) : 0;

    sessions.push({
      id: `session-${i}`,
      sessionNum: i,
      date: date.toISOString(),
      duration: 45 + Math.floor(seededRandom(i * 11) * 90),
      prompt: prompts[(i - 1) % prompts.length],
      scores: {
        wordFindingSpeed: scores.wordFindingSpeed,
        vocabularyDiversity: scores.vocabularyDiversity,
        sentenceComplexity: scores.sentenceComplexity,
        semanticCoherence: scores.semanticCoherence,
        phonemicFluency: scores.phonemicFluency,
      },
      mindScore: scores.mindScore,
      trend,
      txHash: generateTxHash(),
      blockNumber: 19847293 - (28 - i) * 1847,
      confirmed: true,
    });
  }

  return sessions;
}

const SESSIONS = generateSessions();

// ─── HELPER: generate realistic transcript based on prompt ───
function generateTranscript(prompt, lang = 'en') {
  const transcripts = {
    en: {
      "Tell me about something that made you happy this week.": [
        "This week, um, I spent some time with my family... actually visited my parents on Sunday. We had, uh, a really nice lunch together and then, hmm, we walked in the park for a bit. The weather was, like, lovely and it felt good to... to just be around people I love. I also finished a book I had been reading for a while... which, uh, gave me a sense of accomplishment. Overall... it was a calm and warm week.",
        "I went out with, like, some close friends on Friday evening. We tried, um, this new restaurant nearby and the food was really good. We talked... we talked for hours and I laughed a lot. That kind of time with friends always, uh, makes me feel recharged. I also made some progress at work... which felt really satisfying.",
        "Something that made me really happy was, uh, receiving a message from an old friend. I had not spoken to them in years, actually. We ended up having a long conversation... catching up on everything. It reminded me, um, of good memories from college. I also enjoyed cooking a new recipe... no wait, a recipe this weekend that turned out well."
      ],
      "default": [
        "This week, um, I spent some time with my family... actually visited my parents on Sunday. We had, uh, a really nice lunch together and then, hmm, we walked in the park for a bit. The weather was, like, lovely and it felt good to... to just be around people I love. I also finished a book I had been reading for a while... which, uh, gave me a sense of accomplishment. Overall... it was a calm and warm week."
      ]
    },
    hi: {
      "default": [
        "अहह... आज मेरा दिन, उम, बहुत अच्छा था। मैं सुबह जल्दी उठा और, मतलब, थोड़ी देर सैर करने गया। वहाँ का मौसम, जैसे, बहुत शांत और ठंडा था। फिर मैंने, अह, नाश्ता किया और काम पर लग गया। काम में थोड़ा तनाव था लेकिन, ठीक है, शाम को दोस्तों से मिलकर अच्छा लगा। कुल मिलाकर, उम, आज का दिन काफी संतुलित और शांतिपूर्ण था।"
      ]
    },
    ta: {
      "default": [
        "அஹ்... இன்னைக்கு நாள், உம், ரொம்ப நல்லா இருந்தது. காலையில சீக்கிரம் எழுந்து, அதாவது, கொஞ்ச தூரம் நடந்து போனேன். அங்க இருந்த காலநிலை, அப்படியே, ரொம்ப அமைதியா இருந்தது. அப்புறம் நான், அஹ், சாப்பிட்டு வேலைக்கு போனேன். வேலைல கொஞ்சம் டென்ஷன் இருந்தது, ஆனா, பரவாயில்ல, சாயங்காலம் நண்பர்களை பார்த்தது நல்லா இருந்தது. மொத்தத்துல, உம், இன்னைக்கு நாள் ரொம்ப நிம்மதியா இருந்தது."
      ]
    },
    te: {
      "default": [
        "అహ్... ఈ రోజు, ఉమ్, చాలా బాగుంది. పొద్దున్నే త్వరగా లేచి, అంటే, కొంచెం సేపు నడవడానికి వెళ్లాను. అక్కడ వాతావరణం, అలాగే, చాలా ప్రశాంతంగా ఉంది. ఆ తర్వాత నేను, అహో, తిని ఆఫీస్ పని మొదలుపెట్టాను. పనిలో కొంచెం ఒత్తిడి ఉంది, కానీ, పర్వాలేదు, సాయంత్రం స్నేహితులను కలవడం ఆనందంగా ఉంది. మొత్తానికి, ఉమ్, ఈ రోజు చాలా ప్రశాంతంగా గడిచింది."
      ]
    },
    es: {
      "default": [
        "eh... hoy mi día estuvo, hm, bastante bien. Me desperté temprano y, o sea, salí a caminar un poco. El clima estaba, como, muy tranquilo. Luego desayuné y comenzó a trabajar. Hubo algo de estrés en el trabajo, pero, bueno, por la tarde me reuní con amigos. En general, um, fue un día muy tranquilo."
      ]
    },
    fr: {
      "default": [
        "euh... aujourd'hui ma journée s'est, hm, plutôt bien passée. Je me suis réveillé tôt et, je veux dire, je suis allé marcher un peu. Le temps était, genre, très calme. Puis j'ai déjeuné et j'ai commencé à travailler. Il y avait un peu de stress au travail, mais, bon, le soir j'ai vu des amis. Dans l'ensemble, um, c'était une journée tranquille."
      ]
    },
    kn: {
      "default": [
        "ಅಹ್... ಇವತ್ತು ದಿನ, ಉಮ್, ತುಂಬಾ ಚೆನ್ನಾಗಿತ್ತು. ಬೆಳಿಗ್ಗೆ ಬೇಗ ಎದ್ದು, ಅಂದ್ರೆ, ಸ್ವಲ್ಪ ಹೊತ್ತು ವಾಕಿಂಗ್ ಹೋದೆ. ಅಲ್ಲಿನ ವಾತಾವರಣ, ಹಾಗೆ, ತುಂಬಾ ಪ್ರಶಾಂತವಾಗಿತ್ತು. ಆಮೇಲೆ ನಾನು, ಅಹೋ, ಉಪಹಾರ ಮುಗಿಸಿ ಕೆಲಸ ಶುರುಮಾಡಿದೆ. ಕೆಲಸದಲ್ಲಿ ಸ್ವಲ್ಪ ಟೆನ್ಷನ್ ಇತ್ತು, ಆದ್ರೆ, ಪರವಾಗಿಲ್ಲ, ಸಂಜೆ ಸ್ನೇಹಿತರನ್ನು ಭೇಟಿಯಾಗಿದ್ದು ಖುಷಿಕೊಟ್ಟಿತು. ಒಟ್ಟಿನಲ್ಲಿ, ಉಮ್, ಇವತ್ತು ತುಂಬಾ ನೆಮ್ಮದಿಯ ದಿನವಾಗಿತ್ತು."
      ]
    },
    ml: {
      "default": [
        "ആഹ്... ഇന്നത്തെ ദിവസം, ഉം, വളരെ നല്ലതായിരുന്നു. രാവിലെ തന്നെ എഴുന്നേറ്റ്, അതായത്, കുറച്ചു ദൂരം നടക്കാൻ പോയി. അവിടുത്തെ കാലാവസ്ഥ, അങ്ങനെ, വളരെ ശാന്തമായിരുന്നു. അതിനുശേഷം ഞാൻ, അഹ്, ഭക്ഷണം കഴിച്ച് ജോലി തുടങ്ങി. ജോലിയിൽ കുറച്ചു സങ്കീർണ്ണതകൾ ഉണ്ടായിരുന്നു, എങ്കിലും, സാരമില്ല, വൈകുന്നേരം കൂട്ടുകാരെ കണ്ടത് നന്നായി. ആകെത്തുകയിൽ, ഉം, ഇന്നത്തെ ദിവസം വളരെ സന്തോഷകരമായിരുന്നു."
      ]
    }
  };

  const cleanLang = (lang || 'en').split('-')[0].toLowerCase();
  const l = transcripts[cleanLang] ? cleanLang : 'en';
  const list = transcripts[l][prompt] || transcripts[l]["default"];
  return list[Math.floor(Math.random() * list.length)];
}

// ─── HELPER: repetition count in raw text ───
function getRepetitionCount(text) {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').trim().split(/\s+/);
  let count = 0;
  for (let i = 1; i < words.length; i++) {
    if (words[i] === words[i - 1] && words[i].length > 1) {
      count++;
    }
  }
  return count;
}

// ─── HELPER: analyze raw transcript for biomarkers ───
function analyzeRawTranscript(text, duration = 45) {
  const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const words = cleanText.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // 1. Speaking rate
  const durationMin = duration > 0 ? duration / 60 : 0.75;
  const wpm = wordCount / durationMin;

  // 2. Fillers frequency
  const fillers = text.match(/\b(um|uh|hmm|well|like|ah|eh)\b/gi) || [];
  
  // 3. Pauses count
  const pauses = (text.match(/\.\.\.|[.,\/#!$%\^&\*;:{}=\-_`~()?]/g) || []).length;

  // 4. Repetitions count
  const repetitions = getRepetitionCount(text);

  // 5. Self-corrections count
  const corrections = (text.match(/\b(no wait|i mean|actually|or rather|sorry)\b/gi) || []).length;

  // wordFindingSpeed calculation
  let wordFindingSpeed = 95 - (fillers.length * 4) - (repetitions * 5) - (pauses * 1.5);
  wordFindingSpeed = Math.max(30, Math.min(98, Math.round(wordFindingSpeed)));

  // vocabularyDiversity calculation (TTR)
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const ttr = wordCount > 0 ? uniqueWords / wordCount : 0.6;
  let vocabularyDiversity = (ttr * 120) + 20;
  vocabularyDiversity = Math.max(30, Math.min(98, Math.round(vocabularyDiversity)));

  // sentenceComplexity calculation
  const sentences = text.split(/[.!?]|\.\.\./).filter(s => s.trim().length > 0).length || 1;
  const avgSentenceLength = wordCount / sentences;
  const conjunctions = (text.match(/\b(because|although|since|while|if|unless|that|which|who|whom|whereas|though)\b/gi) || []).length;
  let sentenceComplexity = (avgSentenceLength * 2) + (conjunctions * 5) + 40;
  const fragments = text.split(/[.!?]|\.\.\./).filter(s => s.trim().split(/\s+/).length < 4).length;
  sentenceComplexity -= (fragments * 3);
  sentenceComplexity = Math.max(30, Math.min(98, Math.round(sentenceComplexity)));

  // semanticCoherence calculation
  let semanticCoherence = 85;
  if (ttr < 0.4) semanticCoherence -= 15;
  semanticCoherence += (uniqueWords % 5) - 2;
  semanticCoherence = Math.max(35, Math.min(98, Math.round(semanticCoherence)));

  // phonemicFluency calculation
  let phonemicFluency = 95 - (corrections * 6) - (repetitions * 4);
  const wpmDeviance = Math.abs(wpm - 130);
  if (wpmDeviance > 30) {
    phonemicFluency -= Math.min(20, (wpmDeviance - 30) * 0.5);
  }
  phonemicFluency = Math.max(30, Math.min(98, Math.round(phonemicFluency)));

  const mindScore = parseFloat(((wordFindingSpeed + vocabularyDiversity + sentenceComplexity + semanticCoherence + phonemicFluency) / 5).toFixed(1));

  return {
    scores: {
      wordFindingSpeed,
      vocabularyDiversity,
      sentenceComplexity,
      semanticCoherence,
      phonemicFluency,
    },
    mindScore,
  };
}

// ─── HELPER: detect emotion from transcript text ───
function detectEmotion(transcript, mindScore, wpm = 120, fillerRate = 0, pauseRate = 0, acousticMetrics = null) {
  const text = transcript.toLowerCase();

  // Positive signals
  const happyWords = ['happy', 'joy', 'laugh', 'fun', 'enjoyed', 'wonderful', 'lovely', 'great', 'love', 'positive', 'warm', 'smile', 'grateful', 'excited', 'fantastic', 'pleased', 'delightful', 'cheerful', 'amazing', 'good'];
  const calmWords = ['calm', 'peaceful', 'quiet', 'still', 'relaxed', 'comfortable', 'settled', 'steady', 'gentle', 'soft', 'serene', 'nice', 'satisfying', 'safe', 'simple', 'clear', 'easy'];
  const excitedWords = ['excited', 'incredible', 'amazing', 'fantastic', 'thrilled', 'can\'t wait', 'adrenaline', 'awesome', 'wow'];
  const motivatedWords = ['accomplished', 'progress', 'goal', 'achieved', 'productive', 'motivated', 'determined', 'focused', 'success', 'improve', 'growth'];

  // Negative signals
  const stressedWords = ['busy', 'tired', 'overwhelmed', 'deadline', 'rush', 'pressure', 'stress', 'exhaust', 'rushing', 'overloaded', 'too much', 'struggle', 'difficult'];
  const angryWords = ['angry', 'frustrated', 'annoyed', 'upset', 'irritated', 'furious', 'mad', 'rage', 'conflict', 'argument', 'fight'];
  const sadWords = ['sad', 'miss', 'lonely', 'alone', 'grief', 'lost', 'tears', 'cry', 'hurt', 'disappointed', 'unhappy', 'depressed', 'down'];
  const anxiousWords = ['anxious', 'worried', 'nervous', 'uncertain', 'fear', 'scared', 'uneasy', 'tense', 'unsettled', 'concern', 'overthink'];

  const countMatches = (words) => words.filter(w => text.includes(w)).length;

  const scores = {
    Happy: countMatches(happyWords) * 2,
    Calm: countMatches(calmWords) * 2,
    Excited: countMatches(excitedWords) * 2,
    Motivated: countMatches(motivatedWords) * 2,
    Stressed: countMatches(stressedWords) * 2,
    Angry: countMatches(angryWords) * 2,
    Sad: countMatches(sadWords) * 2,
    Anxious: countMatches(anxiousWords) * 2,
    Neutral: 1
  };

  // Adjust based on speech rate
  if (wpm > 155) {
    scores.Excited += 3;
    scores.Stressed += 2;
    scores.Anxious += 1;
  } else if (wpm < 95) {
    scores.Sad += 2;
    scores.Calm += 2;
  }

  // Adjust for pauses and fillers
  if (fillerRate > 0.08 || pauseRate > 0.12) {
    scores.Stressed += 2;
    scores.Anxious += 3;
  }

  // Integrate acoustic metrics if present
  if (acousticMetrics) {
    // Volume variation & pitch variation indicate higher arousal/intensity
    if (acousticMetrics.pitchVariation > 60 || acousticMetrics.volumeVariation > 0.09) {
      scores.Excited += 4;
      scores.Angry += 2;
    }
    // High pause frequency indicates anxiety or high cognitive load
    if (acousticMetrics.pauseFrequency > 6) {
      scores.Anxious += 4;
      scores.Stressed += 2;
    }
    // Low average volume indicates potential sadness or calm
    if (acousticMetrics.avgVolume < 0.03) {
      scores.Sad += 3;
      scores.Calm += 2;
    }
  }

  // Factor in MindScore
  if (mindScore >= 75) { scores.Happy += 3; scores.Calm += 2; }
  else if (mindScore >= 60) { scores.Calm += 2; scores.Neutral += 1; }
  else if (mindScore >= 45) { scores.Stressed += 2; }
  else { scores.Sad += 2; scores.Anxious += 1; }

  // Find winner
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const emotion = (top[1] === 0 || top === undefined) ? 'Neutral' : top[0];
  const confidence = Math.min(97, 72 + top[1] * 2 + Math.floor(Math.random() * 8));

  return { emotion, confidence };
}

// ─── LOCALIZED RESOURCES FOR DYNAMIC GENERATION ───
const LOCALIZED_RESOURCES = {
  en: {
    emotionExplanations: {
      Happy: "You sounded genuinely positive and engaged. Your tone and language patterns reflected warmth and contentment.",
      Calm: "You spoke in a measured, relaxed way. Your thoughts were organized and your pace was steady, suggesting a comfortable mental state.",
      Excited: "Your language showed enthusiasm and energy. You used expressive words and described experiences with a noticeable sense of excitement.",
      Motivated: "Your conversation reflected a sense of purpose and drive. You focused on achievements and forward-looking thoughts.",
      Neutral: "Your tone was balanced and even. No strong emotional signals were detected in either direction today.",
      Stressed: "Some patterns in your speech suggested you may be carrying a heavier mental load than usual. This could reflect current circumstances rather than any long-term concern.",
      Angry: "Your language carried some tension and frustration. This is a natural response to difficult situations and may not reflect your overall state.",
      Sad: "There were gentle notes of sadness or longing in your words. This is a completely normal emotional experience.",
      Anxious: "Some language patterns suggested uncertainty or worry. This is common and does not indicate anything alarming on its own.",
      Lonely: "Your conversation touched on themes of connection and togetherness, suggesting a need for social support."
    },
    summaries: {
      morning: "You outlined your morning routine in detail, detailing early habits, meals, and preparation steps.",
      childhood: "You shared a childhood memory, recalling family, surroundings, and meaningful moments from your past.",
      cook: "You explained how you prepare a favorite meal, detailing ingredients, seasoning, and culinary steps.",
      beach: "You described a place you love to visit, reflecting on the natural environment and why it brings peace or energy.",
      family: "You talked about personal experiences and sources of happiness this week, highlighting connections or achievements.",
      default: "You shared personal reflections, speaking about daily life, memories, and routines in a thoughtful manner."
    },
    whatThisMeans: {
      excellent: "Your overall cognitive markers are excellent today. Articulation was fluid, word finding was prompt, and sentence structure shows healthy logical flow. This is a very strong and stable pattern.",
      good: "Your communication patterns are within a healthy range. Vocabulary choice and speech flow are stable. Some minor pauses or hesitations were detected, which are typical for normal cognitive variation.",
      fair: "Today's assessment shows moderate changes in speech flow or lexical recall. You paused slightly more before words and sentences were a bit simpler. This can often occur due to temporary factors like fatigue or stress.",
      needsAttention: "Your results indicate a notable reduction in speaking rate, vocabulary diversity, or fluency today. This reflects increased cognitive load or fatigue. We recommend resting and observing patterns over future sessions."
    },
    actions: {
      Happy: [
        "Keep your positive momentum going — share something good with a friend today.",
        "Note down what made today feel good so you can revisit it later.",
        "Stay socially active and maintain the routines that are working well.",
        "This is a great day to tackle something you have been putting off."
      ],
      Calm: [
        "Use this peaceful state for focused, deep work or creative activities.",
        "Spend some time outdoors to sustain your calm energy.",
        "Practice a brief meditation or breathing exercise to reinforce this state.",
        "Reach out to someone you care about while you are feeling settled."
      ],
      Excited: [
        "Channel your energy into something productive or creative.",
        "Make sure to also rest — excitement can sometimes mask fatigue.",
        "Share your enthusiasm with someone close to you.",
        "Write down what is driving your energy so you can return to it."
      ],
      Motivated: [
        "Set one clear goal for today while you feel this drive.",
        "Break it into small steps and start immediately.",
        "Celebrate small wins throughout the day.",
        "Protect your focus — minimize distractions while motivation is high."
      ],
      Neutral: [
        "Try doing one thing today that you genuinely enjoy.",
        "A short walk or change of environment can shift your energy.",
        "Check in with a friend or family member.",
        "Consider what is making today feel flat and address one small thing."
      ],
      Stressed: [
        "Take a 5-minute break — step away from your screen.",
        "Drink a glass of water and take three slow, deep breaths.",
        "Write down your top concern and identify one small action you can take.",
        "Reduce screen time and rest your eyes today."
      ],
      Angry: [
        "Take a short walk before responding to anything frustrating.",
        "Practice 4-7-8 breathing: inhale 4 counts, hold 7, exhale 8.",
        "Write down what triggered this feeling without sending it to anyone.",
        "Avoid immediate reactions — give yourself 10 minutes before responding."
      ],
      Sad: [
        "Reach out to a friend or family member just to say hello.",
        "Spend some time outdoors, even briefly.",
        "Do one small thing that you usually enjoy.",
        "Be gentle with yourself — sadness is a normal and valid feeling."
      ],
      Anxious: [
        "Ground yourself: name 5 things you can see, 4 you can touch, 3 you can hear.",
        "Practice slow breathing — inhale for 4, exhale for 6.",
        "Write down your worries and mark which ones you can actually control.",
        "Reduce multitasking — focus on just one thing at a time."
      ],
      Lonely: [
        "Send a message to someone you have not spoken to in a while.",
        "Plan something social for this week, even something small.",
        "Join a community activity or group related to something you enjoy.",
        "Spend time on a hobby that connects you with others."
      ]
    },
    riskExplanations: {
      'Low Concern': "Today's results are within your normal healthy range. No significant changes were detected.",
      'Monitor': "Your results show some fluctuation compared to your baseline. Continue daily check-ins and watch for recurring changes.",
      'Elevated Concern': "We noticed changes compared to your recent baseline. Consider speaking with your healthcare provider if this continues.",
      'High Concern': "Your results show notable changes from your established baseline. We recommend discussing these findings with a healthcare professional."
    },
    biomarkers: {
      wordFindingSpeed: {
        Excellent: "You recalled words quickly and fluently without noticeable pauses. This reflects healthy lexical access.",
        Good: "Your word retrieval was generally smooth with only minor pauses. This is within a healthy range.",
        Fair: "You paused slightly more than usual before some words. This can happen due to fatigue, distraction, or a heavier mental load today.",
        'Needs Attention': "You paused noticeably before finding certain words. This is worth monitoring over time."
      },
      vocabularyDiversity: {
        Excellent: "You used a wide and rich variety of words throughout the conversation. This reflects strong verbal health.",
        Good: "Your vocabulary range was healthy and natural, with good variety across your responses.",
        Fair: "You relied on a somewhat limited range of words today. This can happen when you are tired.",
        'Needs Attention': "Your word variety was narrower than usual today. This is worth observing across sessions."
      },
      sentenceComplexity: {
        Excellent: "You constructed well-structured and complex sentences effortlessly. This shows strong cognitive organization.",
        Good: "Your sentences were clear and reasonably well structured. Your thinking appeared organized.",
        Fair: "Your sentences were a bit simpler than your baseline. This is not a concern on its own.",
        'Needs Attention': "Your sentence structure was simpler than previous sessions. This can indicate cognitive fatigue today."
      },
      semanticCoherence: {
        Excellent: "Your ideas flowed logically from one to the next. Your conversation was very easy to follow.",
        Good: "Your thoughts connected well and you stayed on topic throughout most of the conversation.",
        Fair: "Your conversation drifted slightly at times. This is common during everyday speech.",
        'Needs Attention': "There were some moments where your ideas shifted unexpectedly. This could reflect distraction."
      },
      phonemicFluency: {
        Excellent: "Your articulation was smooth and clear throughout. Your speech flow was natural and confident.",
        Good: "Your speech was clear with only minor hesitations. This is a healthy and normal range.",
        Fair: "There were some hesitations or minor speech corrections today. Fatigue can affect this.",
        'Needs Attention': "Your articulation showed more hesitations than usual. This can be influenced by tiredness."
      }
    },
    riskLabel: {
      'Low Concern': '🟢 Low Concern',
      'Monitor': '🟡 Monitor',
      'Elevated Concern': '🟠 Elevated Concern',
      'High Concern': '🔴 High Concern'
    },
    trends: {
      stable: "Communication patterns remain stable",
      improved: "Cognitive scores show positive momentum",
      fatigue: "Speech markers suggest moderate cognitive fatigue",
      declined: "Fluency markers are slightly below baseline"
    },
    assistantText: "Hello. I have finished analyzing today's check-in. %SUMMARY% You appeared %EMOTION% today. Your overall MindScore is %SCORE%, which is %TREND%. %RISK% Our primary recommendation is to: %ACTION% Take care.",
    emotions: {
      Happy: 'happy',
      Calm: 'calm',
      Excited: 'excited',
      Motivated: 'motivated',
      Neutral: 'neutral',
      Stressed: 'stressed',
      Angry: 'angry',
      Sad: 'sad',
      Anxious: 'anxious',
      Lonely: 'lonely'
    }
  },
  hi: { // Hindi Translations
    emotionExplanations: {
      Happy: "आप बातचीत के दौरान काफी सकारात्मक और खुश लग रहे थे। आपके लहजे से प्रसन्नता झलक रही थी।",
      Calm: "आप बहुत शांत और संतुलित तरीके से बोले। आपके विचार व्यवस्थित थे और आपकी गति स्थिर थी।",
      Excited: "आपकी भाषा में ऊर्जा और उत्साह देखा गया। आपने अपनी बातों को बहुत खुशी से व्यक्त किया।",
      Motivated: "आप प्रेरित और लक्ष्य-उन्मुख लग रहे थे। आपका ध्यान सफलता और उपलब्धियों पर केंद्रित था।",
      Neutral: "आपकी आवाज़ संतुलित और सामान्य थी। आज कोई विशेष भावनात्मक उतार-चढ़ाव नहीं दिखा।",
      Stressed: "आपके भाषण के पैटर्न बताते हैं कि आप पर मानसिक दबाव है। कृपया थोड़ा आराम करें।",
      Angry: "आपके लहजे में कुछ तनाव और नाराजगी महसूस हुई। प्रतिक्रिया देने से पहले थोड़ा रुकें।",
      Sad: "आपकी आवाज़ में थोड़ी उदासी या भारीपन महसूस हुआ। आज अपना विशेष ध्यान रखें।",
      Anxious: "आपके भाषण में कुछ घबराहट या अनिश्चितता दिखी। गहरी सांसें लें और शांत रहें।",
      Lonely: "आपकी बातचीत में सामाजिक संपर्क की आवश्यकता और अकेलेपन के संकेत मिले।"
    },
    summaries: {
      morning: "आपने अपनी सुबह की दिनचर्या, शुरुआती आदतों और भोजन की तैयारी के बारे में विस्तार से बताया।",
      childhood: "आपने बचपन की एक याद साझा की, जिसमें परिवार, पर्यावरण और अपने अतीत के खास पलों को याद किया।",
      cook: "आपने अपने पसंदीदा भोजन की रेसिपी और उसे पकाने की पूरी प्रक्रिया को विस्तार से समझाया।",
      beach: "आपने अपनी पसंदीदा जगह का वर्णन किया और बताया कि वहाँ आपको शांति और सकारात्मक ऊर्जा क्यों मिलती है।",
      family: "आपने अपने व्यक्तिगत अनुभवों और इस सप्ताह की खुशियों के बारे में बात की, जिसमें संबंधों पर ध्यान था।",
      default: "आपने अपने दैनिक जीवन, यादों और दिनचर्या के बारे में बहुत ही विचारशील तरीके से बातें साझा कीं।"
    },
    whatThisMeans: {
      excellent: "आपके समग्र संज्ञानात्मक संकेतक आज उत्कृष्ट हैं। शब्दों का चयन शीघ्र था और वाक्य संरचना तार्किक थी।",
      good: "आपकी संचार शैली स्वस्थ सीमा के भीतर है। शब्दावली और प्रवाह पूरी तरह से स्थिर हैं।",
      fair: "आज के मूल्यांकन में प्रवाह में कुछ कमी दिखी है, जो थकान या मानसिक तनाव के कारण हो सकती है।",
      needsAttention: "आपके परिणामों में बोलने की गति और स्पष्टता में कमी देखी गई है। हम आराम करने की सलाह देते हैं।"
    },
    actions: {
      Happy: [
        "अपनी सकारात्मक ऊर्जा को बनाए रखें — आज किसी मित्र के साथ अच्छी बातें साझा करें।",
        "डायरी में लिखें कि आज क्या अच्छा रहा ताकि आप इसे बाद में याद कर सकें।",
        "सकारात्मक आदतों और दिनचर्या को जारी रखें जो आपके लिए काम कर रही हैं।"
      ],
      Calm: [
        "इस शांत मानसिक स्थिति का उपयोग किसी केंद्रित या रचनात्मक कार्य के लिए करें।",
        "अपनी शांत ऊर्जा को बनाए रखने के लिए थोड़ा समय प्रकृति के बीच बिताएं।",
        "इस सुखद स्थिति को और सुदृढ़ करने के लिए संक्षिप्त प्राणायाम का अभ्यास करें।"
      ],
      Excited: [
        "अपनी उच्च ऊर्जा को किसी रचनात्मक या उत्पादक कार्य में लगाएं।",
        "पर्याप्त आराम भी करें — अत्यधिक उत्साह कभी-कभी थकान को छिपा सकता है।",
        "अपनी इस खुशी और उत्साह को अपने किसी करीबी के साथ साझा करें।"
      ],
      Motivated: [
        "आज के लिए एक स्पष्ट लक्ष्य निर्धारित करें और उस पर तुरंत काम शुरू करें।",
        "अपने काम को छोटे-छोटे चरणों में विभाजित करें और आगे बढ़ें।",
        "काम के दौरान ध्यान भटकने वाली चीजों को खुद से दूर रखें।"
      ],
      Neutral: [
        "आज कोई ऐसा काम करें जिसे करने में आपको वास्तव में आनंद आता हो।",
        "एक छोटी सैर या वातावरण में बदलाव आपकी ऊर्जा को सकारात्मक बना सकता है।",
        "किसी पुराने दोस्त या परिवार के सदस्य से फोन पर बातचीत करें।"
      ],
      Stressed: [
        "काम से 5 मिनट का ब्रेक लें — स्क्रीन और फोन से थोड़ी दूरी बनाएं।",
        "एक गिलास पानी पिएं और धीरे-धीरे तीन बार गहरी सांसें लें।",
        "आज अपने कार्यों की सूची को छोटा करें और केवल महत्वपूर्ण काम करें।"
      ],
      Angry: [
        "किसी भी उत्तेजक बात का जवाब देने से पहले थोड़ी देर टहलें।",
        "४-७-८ ब्रीदिंग का अभ्यास करें: ४ सेकंड सांस लें, ७ सेकंड रोकें, ८ सेकंड छोड़ें।",
        "शांत होने के लिए खुद को १० मिनट का समय दें, फिर कोई निर्णय लें।"
      ],
      Sad: [
        "अपने किसी करीबी या मित्र को सिर्फ हाल-चाल जानने के लिए संदेश भेजें।",
        "थोड़ी देर के लिए बाहर खुली हवा में टहलने जाएं।",
        "स्वयं के प्रति दयालु रहें — उदासी एक सामान्य मानवीय भावना है।"
      ],
      Anxious: [
        "खुद को स्थिर करें: ५ चीजें जो आप देख सकते हैं, ४ जो छू सकते हैं, ३ जो सुन सकते हैं, उन्हें महसूस करें।",
        "धीरे-धीरे सांस लें — ४ सेकंड में सांस अंदर लें और ६ सेकंड में बाहर छोड़ें।",
        "एक समय में केवल एक ही काम पर अपना ध्यान केंद्रित करें।"
      ],
      Lonely: [
        "किसी ऐसे व्यक्ति को संदेश भेजें जिससे आपने लंबे समय से बात नहीं की है।",
        "इस सप्ताह के लिए किसी सामाजिक गतिविधि या छोटी मुलाकात की योजना बनाएं।",
        "کسی ऐसी रुचि या शौक पर समय बिताएं जो आपको दूसरों से जोड़ता हो।"
      ]
    },
    riskExplanations: {
      'Low Concern': "आज के परिणाम आपकी सामान्य स्वस्थ सीमा के भीतर हैं। कोई महत्वपूर्ण बदलाव नहीं देखा गया।",
      'Monitor': "आपके परिणामों में आपकी आधारभूत स्थिति की तुलना में कुछ उतार-चढ़ाव दिखा है। दैनिक चेक-इन जारी रखें।",
      'Elevated Concern': "हमने आपकी हालिया स्थिति की तुलना में कुछ बदलाव देखे हैं। यदि यह जारी रहता है, तो डॉक्टर से परामर्श लें।",
      'High Concern': "आपके परिणाम स्थापित आधार रेखा से महत्वपूर्ण विचलन दर्शाते हैं। हम पेशेवर सलाह लेने की सिफारिश करते हैं।"
    },
    biomarkers: {
      wordFindingSpeed: {
        Excellent: "आपने बिना किसी रुकावट के बहुत तेजी से और स्पष्ट रूप से शब्दों को याद किया।",
        Good: "आपके शब्दों का चयन काफी सुचारू था, जिसमें केवल छोटे विराम थे।",
        Fair: "आज आपने शब्दों को याद करने में सामान्य से थोड़ा अधिक समय लिया, जो थकान के कारण हो सकता है।",
        'Needs Attention': "आपको शब्दों को याद करने में स्पष्ट रूप से कठिनाई हुई, जो मानसिक तनाव का संकेत है।"
      },
      vocabularyDiversity: {
        Excellent: "आपने बातचीत में बहुत समृद्ध और विविध शब्दों का उपयोग किया।",
        Good: "आपकी शब्दावली का दायरा स्वस्थ, प्राकृतिक और विविधता से भरपूर था।",
        Fair: "आज आपने कुछ सीमित शब्दों का ही बार-बार उपयोग किया।",
        'Needs Attention': "आपकी शब्दावली आज सामान्य से काफी सीमित थी।"
      },
      sentenceComplexity: {
        Excellent: "आपने बिना किसी प्रयास के बहुत अच्छी तरह से संरचित और जटिल वाक्य बनाए।",
        Good: "आपके वाक्य स्पष्ट और व्यवस्थित थे। आपकी सोच तार्किक लग रही थी।",
        Fair: "आपके वाक्य सामान्य से थोड़े सरल थे, जो मानसिक सुस्ती का संकेत हो सकता है।",
        'Needs Attention': "आज आपके वाक्यों की संरचना बहुत सरल थी, जो मानसिक थकान को दर्शाती है।"
      },
      semanticCoherence: {
        Excellent: "आपके विचार बहुत तार्किक रूप से एक से दूसरे से जुड़े थे। बातचीत को समझना आसान था।",
        Good: "आपके विचार आपस में जुड़े हुए थे और आप पूरी बातचीत के दौरान मुख्य विषय पर टिके रहे।",
        Fair: "बातचीत के दौरान आपका ध्यान कभी-कभी मुख्य विषय से थोड़ा भटका।",
        'Needs Attention': "बातचीत में कुछ ऐसे क्षण थे जहाँ आपके विचार अचानक और बिना स्पष्ट जुड़ाव के बदल गए।"
      },
      phonemicFluency: {
        Excellent: "पूरी बातचीत में आपका उच्चारण बहुत सहज और स्पष्ट था। प्रवाह प्राकृतिक था।",
        Good: "आपका भाषण स्पष्ट था और केवल छोटी हिचकिचाहटें थीं, जो पूरी तरह से सामान्य हैं।",
        Fair: "आज बातचीत में कुछ हिचकिचाहट या सुधार के प्रयास देखे गए।",
        'Needs Attention': "आपके उच्चारण में सामान्य से अधिक हिचकिचाहटें थीं, जो थकान के कारण हो सकती हैं।"
      }
    },
    riskLabel: {
      'Low Concern': '🟢 सामान्य चिंता',
      'Monitor': '🟡 निगरानी रखें',
      'Elevated Concern': '🟠 बढ़ी हुई चिंता',
      'High Concern': '🔴 उच्च चिंता'
    },
    trends: {
      stable: "संचार शैली पूरी तरह से स्थिर है",
      improved: "संज्ञानात्मक स्कोर में सकारात्मक सुधार दिख रहा है",
      fatigue: "संकेत बताते हैं कि आपको मानसिक थकान है",
      declined: "प्रवाह संकेतक सामान्य से थोड़े नीचे हैं"
    },
    assistantText: "नमस्ते। मैंने आज के चेक-इन का विश्लेषण पूरा कर लिया है। %SUMMARY% आज आप %EMOTION% लग रहे थे। आपका कुल माइंडस्कोर %SCORE% है, जो पिछले सत्र की तुलना में %TREND% है। %RISK% हमारी सलाह है: %ACTION% अपना ख्याल रखें।",
    emotions: {
      Happy: 'खुश',
      Calm: 'शांत',
      Excited: 'उत्साहित',
      Motivated: 'प्रेरित',
      Neutral: 'सामान्य',
      Stressed: 'तनावग्रस्त',
      Angry: 'क्रोधित',
      Sad: 'उदास',
      Anxious: 'चिंतित',
      Lonely: 'अकेला'
    }
  },
  // es (Spanish)
  es: {
    emotionExplanations: {
      Happy: "Se le notó genuinamente positivo y participativo. Su tono reflejó calidez y satisfacción.",
      Calm: "Habló de manera pausada y relajada. Sus pensamientos estaban organizados y su ritmo fue constante.",
      Excited: "Su lenguaje mostró gran entusiasmo y energía. Describió sus vivencias con alegría.",
      Motivated: "Su conversación reflejó un claro propósito y empuje. Se enfocó en metas y logros.",
      Neutral: "Su tono fue equilibrado y neutro. No se detectaron fluctuaciones emocionales marcadas hoy.",
      Stressed: "Algunos patrones sugieren que podría estar bajo una carga mental pesada hoy. Descanse un poco.",
      Angry: "Su hablar reflejó cierta tensión o frustración. Intente tomar una pausa y respirar hondo.",
      Sad: "Había notas suaves de tristeza en sus palabras. Sea amable consigo mismo hoy.",
      Anxious: "Algunos patrones sugieren preocupación o nerviosismo. Concéntrese en el presente.",
      Lonely: "Su conversación aludió a temas de compañía, sugiriendo la necesidad de mayor apoyo social."
    },
    summaries: {
      morning: "Detalló su rutina matutina con precisión, incluyendo hábitos tempranos y su desayuno.",
      childhood: "Compartió un recuerdo de su infancia, rememorando vivencias familiares entrañables.",
      cook: "Explicó cómo prepara su comida favorita paso a paso, con ingredientes y sazón.",
      beach: "Describió un lugar que ama visitar, reflexionando sobre la paz que este le brinda.",
      family: "Habló sobre sus fuentes de alegría esta semana, destacando sus relaciones personales.",
      default: "Compartió reflexiones personales sobre su vida diaria, rutinas y recuerdos de forma amena."
    },
    whatThisMeans: {
      excellent: "Sus marcadores cognitivos generales son excelentes hoy. Su habla fue fluida y estructurada.",
      good: "Sus patrones de comunicación están en un rango saludable. Su vocabulario y ritmo son estables.",
      fair: "El análisis muestra leves variaciones en el ritmo, posiblemente debido a fatiga o estrés temporal.",
      needsAttention: "Se observa una reducción en el ritmo del habla y la fluidez. Recomendamos descansar."
    },
    actions: {
      Happy: [
        "Mantenga este impulso positivo compartiendo algo agradable con un amigo hoy.",
        "Anote lo que le hizo sentir bien hoy para poder recordarlo después.",
        "Mantenga las rutinas activas que le están dando buenos resultados."
      ],
      Calm: [
        "Aproveche este estado de paz para realizar tareas creativas o de alta concentración.",
        "Pase algo de tiempo al aire libre para prolongar esta energía tranquila.",
        "Practique una respiración guiada para afianzar este estado de bienestar."
      ],
      Excited: [
        "Canalice esta energía en un proyecto productivo o creativo.",
        "No olvide descansar; a veces la emoción puede enmascarar el cansancio.",
        "Comparta su entusiasmo con alguien cercano."
      ],
      Motivated: [
        "Defina una meta clara para hoy y dé el primer paso de inmediato.",
        "Divida sus tareas en pasos pequeños y avance con paso firme.",
        "Evite distracciones mientras mantenga esta gran motivación."
      ],
      Neutral: [
        "Realice hoy al menos una actividad que disfrute genuinamente.",
        "Un paseo corto o un cambio de ambiente pueden renovar su energía.",
        "Envíe un mensaje a un amigo o familiar para conversar un momento."
      ],
      Stressed: [
        "Tómese un descanso de 5 minutos lejos de cualquier pantalla.",
        "Beba un vaso de agua y realice tres respiraciones profundas.",
        "Reduzca su lista de pendientes para hoy a lo esencial."
      ],
      Angry: [
        "Dé un paseo corto antes de reaccionar a cualquier situación tensa.",
        "Respire lentamente: inhale en 4 tiempos, retenga 7, exhale en 8.",
        "Tómese 10 minutos para calmarse antes de responder."
      ],
      Sad: [
        "Escriba o llame a un amigo cercano solo para conversar.",
        "Intente caminar un momento bajo el sol o al aire libre.",
        "Recuerde ser amable consigo mismo; la tristeza es una emoción natural."
      ],
      Anxious: [
        "Conéctese con el presente: nombre 5 cosas a su alrededor y respire.",
        "Respire lento: inhale en 4 tiempos y exhale en 6.",
        "Enfóquese en realizar una sola actividad sencilla a la vez."
      ],
      Lonely: [
        "Salude a un amigo o familiar con quien no haya hablado recientemente.",
        "Planifique una actividad social sencilla para esta semana.",
        "Dedique tiempo a un pasatiempo que le permita socializar."
      ]
    },
    riskExplanations: {
      'Low Concern': "Sus resultados están dentro de su rango saludable normal. No hay cambios de cuidado.",
      'Monitor': "Sus resultados muestran ligeras fluctuaciones con respecto a su línea base. Siga observando.",
      'Elevated Concern': "Detectamos variaciones frente a sus registros previos. Consulte a un médico si persiste.",
      'High Concern': "Sus indicadores muestran desvíos notables. Le sugerimos consultar con un especialista."
    },
    biomarkers: {
      wordFindingSpeed: {
        Excellent: "Recordó las palabras de forma fluida y rápida, sin pausas notables.",
        Good: "Su recuperación de palabras fue buena en general, con pausas muy breves.",
        Fair: "Pausó un poco más de lo habitual hoy, probablemente debido a cansancio.",
        'Needs Attention': "Tuvo pausas significativas para evocar palabras, lo que sugiere alta carga cognitiva."
      },
      vocabularyDiversity: {
        Excellent: "Utilizó un vocabulario rico, variado y preciso durante la sesión.",
        Good: "Su rango de vocabulario fue natural y saludable, mostrando buena variedad.",
        Fair: "Su rango de palabras fue ligeramente limitado hoy.",
        'Needs Attention': "Su diversidad de vocabulario fue menor de lo habitual hoy."
      },
      sentenceComplexity: {
        Excellent: "Construyó oraciones complejas y bien estructuradas sin esfuerzo.",
        Good: "Sus frases fueron claras y con un orden lógico. Su pensamiento se notó organizado.",
        Fair: "Sus oraciones fueron más sencillas de lo habitual hoy.",
        'Needs Attention': "Estructuró frases muy cortas y simples, lo que puede denotar fatiga."
      },
      semanticCoherence: {
        Excellent: "Sus ideas fluyeron de manera lógica y coherente en todo momento.",
        Good: "Conectó bien sus pensamientos y se mantuvo enfocado en el tema.",
        Fair: "Se desvió levemente del tema principal en algunos momentos.",
        'Needs Attention': "Hubo cambios abruptos en el desarrollo de sus ideas."
      },
      phonemicFluency: {
        Excellent: "Su articulación fue limpia y su habla fluyó con naturalidad.",
        Good: "Su habla fue clara con mínimas dudas o autocorrecciones.",
        Fair: "Se observaron algunas vacilaciones o tropiezos al hablar hoy.",
        'Needs Attention': "Registró más vacilaciones de lo común, debido a fatiga o distracciones."
      }
    },
    riskLabel: {
      'Low Concern': '🟢 Bajo Riesgo',
      'Monitor': '🟡 Monitorear',
      'Elevated Concern': '🟠 Riesgo Moderado',
      'High Concern': '🔴 Riesgo Elevado'
    },
    trends: {
      stable: "Su comunicación se mantiene estable",
      improved: "Sus puntuaciones muestran una tendencia positiva",
      fatigue: "Los patrones del habla sugieren fatiga cognitiva leve",
      declined: "Los marcadores de fluidez están por debajo de la base"
    },
    assistantText: "Hola. He concluido el análisis de hoy. %SUMMARY% Hoy se le notó %EMOTION%. Su MindScore general es de %SCORE%, lo cual está %TREND% respecto al control anterior. %RISK% Le recomiendo: %ACTION% Cuídese.",
    emotions: {
      Happy: 'feliz',
      Calm: 'tranquilo',
      Excited: 'entusiasmado',
      Motivated: 'motivado',
      Neutral: 'neutral',
      Stressed: 'estresado',
      Angry: 'enojado',
      Sad: 'triste',
      Anxious: 'ansioso',
      Lonely: 'solitario'
    }
  },
  // fr (French)
  fr: {
    emotionExplanations: {
      Happy: "Vous sembliez sincèrement positif et impliqué. Votre ton a reflété de la chaleur et du contentement.",
      Calm: "Vous avez parlé de façon posée et détendue. Vos idées étaient structurées et votre débit régulier.",
      Excited: "Votre discours a montré beaucoup d'enthousiasme et d'énergie constructive.",
      Motivated: "Votre conversation a reflété de la détermination. Vous étiez axé sur vos projets.",
      Neutral: "Votre ton était équilibré. Aucun signal émotionnel marqué n'a été détecté aujourd'hui.",
      Stressed: "Certains motifs de parole suggèrent que vous portez une charge mentale lourde aujourd'hui. Reposez-vous.",
      Angry: "Votre intonation a laissé transparaître de la tension ou de l'agacement. Prenez un temps de pause.",
      Sad: "Il y avait des notes de tristesse dans vos propos. Prenez soin de vous aujourd'hui.",
      Anxious: "Votre élocution a montré des signes d'inquiétude. Recentrez-vous sur des choses simples.",
      Lonely: "Vos propos ont évoqué le besoin de soutien et de contact social."
    },
    summaries: {
      morning: "Vous avez décrit votre routine matinale avec précision, détaillant vos premières habitudes.",
      childhood: "Vous avez partagé un souvenir d'enfance touchant, évoquant vos racines familiales.",
      cook: "Vous avez expliqué la préparation de votre plat préféré étape par étape.",
      beach: "Vous avez décrit un lieu cher à votre cœur, expliquant la sérénité qu'il vous inspire.",
      family: "Vous avez évoqué vos moments de bonheur de la semaine, notamment vos relations proches.",
      default: "Vous avez partagé des réflexions personnelles sur votre quotidien de façon structurée."
    },
    whatThisMeans: {
      excellent: "Vos indicateurs cognitifs sont excellents. L'élocution était fluide et le vocabulaire riche.",
      good: "Vos schémas de communication sont tout à fait sains et votre débit est régulier.",
      fair: "L'analyse montre de légères variations, possiblement dues à de la fatigue passagère.",
      needsAttention: "Nous observons un ralentissement du débit et une baisse de fluidité. Un repos est conseillé."
    },
    actions: {
      Happy: [
        "Partagez cette belle énergie avec un ami aujourd'hui.",
        "Notez par écrit ce qui vous a fait plaisir aujourd'hui.",
        "Poursuivez les routines positives qui vous réussissent."
      ],
      Calm: [
        "Mettez à profit cet état de paix pour des activités de réflexion ou de création.",
        "Passez un moment en extérieur pour prolonger cette énergie sereine.",
        "Pratiquez une courte séance de cohérence cardiaque pour ancrer ce bien-être."
      ],
      Excited: [
        "Canalisez cette belle vitalité dans un projet stimulant.",
        "Pensez aussi à vous reposer; l'enthousiasme peut masquer la fatigue.",
        "Partagez votre joie avec vos proches."
      ],
      Motivated: [
        "Fixez-vous un objectif clair pour aujourd'hui et lancez-vous.",
        "Divisez votre projet en étapes simples et avancez.",
        "Éliminez les distractions tant que votre concentration est maximale."
      ],
      Neutral: [
        "Faites au moins une petite chose qui vous fait plaisir aujourd'hui.",
        "Une courte marche ou un changement de cadre peut vous redynamiser.",
        "Prenez des nouvelles d'un proche."
      ],
      Stressed: [
        "Faites une pause de 5 minutes loin des écrans.",
        "Buvez un verre d'eau et prenez trois grandes inspirations lentes.",
        "Allégez votre programme de la journée pour vous concentrer sur l'essentiel."
      ],
      Angry: [
        "Allez marcher un instant avant de répondre à une contrariété.",
        "Pratiquez une respiration lente : inspirez sur 4 temps, bloquez 7, expirez sur 8.",
        "Accordez-vous 10 minutes de calme avant de prendre une décision."
      ],
      Sad: [
        "Appelez ou envoyez un message à un ami proche.",
        "Sortez marcher un moment à la lumière du jour.",
        "Soyez indulgent avec vous-même; la tristesse est une émotion légitime."
      ],
      Anxious: [
        "Revenez au présent : nommez 5 objets visibles autour de vous.",
        "Inspirez sur 4 temps et expirez sur 6 temps pour vous apaiser.",
        "Faites une seule chose simple à la fois."
      ],
      Lonely: [
        "Prenez contact avec une personne perdue de vue depuis quelque temps.",
        "Planifiez une sortie simple cette semaine.",
        "Consacrez du temps à une activité associative ou collective."
      ]
    },
    riskExplanations: {
      'Low Concern': "Vos résultats sont tout à fait stables et conformes à vos habitudes.",
      'Monitor': "Vos scores montrent de légères fluctuations par rapport à votre moyenne. À suivre.",
      'Elevated Concern': "Des variations sont apparues. Si cela persiste, parlez-en à un professionnel.",
      'High Concern': "Vos indicateurs montrent un décalage net. Nous vous conseillons de consulter un médecin."
    },
    biomarkers: {
      wordFindingSpeed: {
        Excellent: "Vous avez trouvé vos mots rapidement et sans hésitations notables.",
        Good: "La recherche des mots a été fluide dans l'ensemble, avec de très courtes pauses.",
        Fair: "Vous avez marqué un peu plus de pauses aujourd'hui, signe possible de fatigue.",
        'Needs Attention': "Des pauses marquées indiquent une fatigue cognitive ou un manque de sommeil."
      },
      vocabularyDiversity: {
        Excellent: "Votre choix de mots a été riche, varié et particulièrement précis.",
        Good: "Votre vocabulaire est varié, naturel et adapté à vos propos.",
        Fair: "Votre choix de mots a été un peu plus restreint aujourd'hui.",
        'Needs Attention': "Votre diversité lexicale est en retrait aujourd'hui."
      },
      sentenceComplexity: {
        Excellent: "Vous avez formulé des phrases complexes et bien articulées sans effort.",
        Good: "Vos phrases étaient claires et bien construites. Votre pensée était bien structurée.",
        Fair: "Vos structures de phrases étaient plus simples aujourd'hui.",
        'Needs Attention': "Vos phrases étaient très courtes et basiques, traduisant une fatigue mentale."
      },
      semanticCoherence: {
        Excellent: "Vos idées se sont enchaînées avec une logique parfaite.",
        Good: "Vos propos étaient bien connectés et vous êtes resté centré sur votre sujet.",
        Fair: "Vous vous êtes légèrement éloigné de votre sujet par moments.",
        'Needs Attention': "Des ruptures logiques ont été observées dans votre discours."
      },
      phonemicFluency: {
        Excellent: "Votre élocution a été particulièrement fluide et naturelle du début à la fin.",
        Good: "Votre voix était claire avec très peu de bafouillages ou d'autocorrections.",
        Fair: "L'élocution a présenté quelques hésitations ou reprises aujourd'hui.",
        'Needs Attention': "Le débit a été heurté par de nombreuses hésitations, dues à de la fatigue."
      }
    },
    riskLabel: {
      'Low Concern': '🟢 Risque Faible',
      'Monitor': '🟡 Surveiller',
      'Elevated Concern': '🟠 Risque Modéré',
      'High Concern': '🔴 Risque Élevé'
    },
    trends: {
      stable: "Votre élocution reste stable",
      improved: "Vos scores cognitifs progressent positivement",
      fatigue: "Certains marqueurs indiquent une fatigue cognitive modérée",
      declined: "La fluidité verbale est en retrait par rapport à d'habitude"
    },
    assistantText: "Bonjour. J'ai terminé l'analyse de votre session. %SUMMARY% Vous sembliez %EMOTION% aujourd'hui. Votre score cognitif est de %SCORE%, ce qui est %TREND% par rapport à la dernière fois. %RISK% Mon conseil : %ACTION% Prenez soin de vous.",
    emotions: {
      Happy: 'heureux',
      Calm: 'calme',
      Excited: 'excité',
      Motivated: 'motivé',
      Neutral: 'neutre',
      Stressed: 'stressé',
      Angry: 'en colère',
      Sad: 'triste',
      Anxious: 'anxieux',
      Lonely: 'seul'
    }
  },
  // ta (Tamil)
  ta: {
    emotionExplanations: {
      Happy: "நீங்கள் மிகவும் நேர்மறையாகவும் மகிழ்ச்சியாகவும் பேசினீர்கள். உங்கள் குரலில் நிம்மதி தெரிந்தது.",
      Calm: "நீங்கள் மிகவும் நிதானமாகவும் அமைதியாகவும் பேசினீர்கள். உங்கள் எண்ணங்கள் ஒழுங்கமைக்கப்பட்டிருந்தன.",
      Excited: "உங்கள் குரல் மிகுந்த ஆற்றலையும் உற்சாகத்தையும் காட்டியது.",
      Motivated: "நீங்கள் உந்துதலுடனும் இலக்குடனும் காணப்பட்டீர்கள்.",
      Neutral: "உங்கள் குரல் சமநிலையாக இருந்தது. உணர்ச்சி மாற்றங்கள் ஏதும் கண்டறியப்படவில்லை.",
      Stressed: "நீங்கள் கூடுதல் மன அழுத்தத்தில் இருப்பது போல் குரல் காட்டுகிறது. சிறிது ஓய்வெடுக்கவும்.",
      Angry: "உங்கள் குரலில் பதற்றமும் கோபமும் தெரிந்தது. அமைதி காக்கவும்.",
      Sad: "உங்கள் பேச்சில் சோகம் தெரிந்தது. உங்களை கவனமாக பார்த்துக் கொள்ளுங்கள்.",
      Anxious: "உங்கள் பேச்சில் பதற்றமும் கவலையும் தெரிந்தது. ஆழ்ந்த மூச்சு பயிற்சி செய்யவும்.",
      Lonely: "உங்கள் உரையாடலில் தனிமையின் உணர்வுகள் தெரிந்தன."
    },
    summaries: {
      morning: "உங்கள் காலை வழக்கத்தைப் பற்றியும் உணவு முறையைப் பற்றியும் விளக்கினீர்கள்.",
      childhood: "உங்கள் சிறுவயது நினைவையும் குடும்பத்துடனான மகிழ்ச்சியான தருணங்களையும் பகிர்ந்தீர்கள்.",
      cook: "உங்களுக்குப் பிடித்த உணவை சமைக்கும் முறையை விளக்கினீர்கள்.",
      beach: "உங்களுக்கு பிடித்த அமைதியான இடத்தை விவரித்தீர்கள்.",
      family: "இந்த வார மகிழ்ச்சியான நிகழ்வுகளைப் பற்றி விவரித்தீர்கள்.",
      default: "உங்கள் அன்றாட வாழ்க்கை மற்றும் நினைவுகளைப் பற்றி ஆழமாகப் பகிர்ந்தீர்கள்."
    },
    whatThisMeans: {
      excellent: "உங்கள் அறிவாற்றல் குறிப்பான்கள் இன்று மிகச் சிறப்பாக உள்ளன. பேச்சு சீராக இருந்தது.",
      good: "உங்கள் பேச்சு ஆரோக்கியமான வரம்பிற்குள் உள்ளது. வார்த்தைகளும் சீரானவை.",
      fair: "இன்று பேச்சில் சிறிது தளர்வு தெரிந்தது. இது சோர்வினால் இருக்கலாம்.",
      needsAttention: "பேச்சு வேகம் மற்றும் தெளிவு குறைந்துள்ளது. ஓய்வெடுப்பது நல்லது."
    },
    actions: {
      Happy: ["மகிழ்ச்சியான எண்ணங்களை நண்பர்களுடன் பகிர்ந்து கொள்ளுங்கள்.", "இன்றைய நல்ல தருணங்களை குறித்து வையுங்கள்.", "நல்ல பழக்கங்களை தொடருங்கள்."],
      Calm: ["அமைதியான மனநிலையை நல்ல வேலைகளுக்கு பயன்படுத்துங்கள்.", "இயற்கையோடு சிறிது நேரம் செலவிடுங்கள்.", "மூச்சுப்பயிற்சி செய்யுங்கள்."],
      Excited: ["ஆற்றலை பயனுள்ள வேலைகளில் செலுத்துங்கள்.", "ஓய்வெடுக்க மறக்காதீர்கள்.", "மகிழ்ச்சியை பகிருங்கள்."],
      Motivated: ["இன்றைய இலக்கை முடிவு செய்து செயல்படுங்கள்.", "வேலையை சிறு பகுதிகளாக பிரித்து செய்யுங்கள்.", "கவனம் சிதறாமல் பார்த்துக் கொள்ளுங்கள்."],
      Neutral: ["பிடித்தமான ஒரு செயலை இன்று செய்யுங்கள்.", "சிறிது தூரம் நடந்து செல்லுங்கள்.", "நண்பர்களிடம் பேசுங்கள்."],
      Stressed: ["திரைகளில் இருந்து விலகி 5 நிமிடம் ஓய்வெடுங்கள்.", "தண்ணீர் குடித்துவிட்டு மெதுவாக மூச்சு விடுங்கள்.", "வேலைகளை குறைத்துக் கொள்ளுங்கள்."],
      Angry: ["பதிலளிக்கும் முன் சிறிது தூரம் நடந்து செல்லுங்கள்.", "ஆழ்ந்த மூச்சு பயிற்சி செய்யவும்.", "முடிவெடுக்கும் முன் 10 நிமிடம் பொறுமையாக இருங்கள்."],
      Sad: ["நண்பர்கள் அல்லது குடும்பத்தினரிடம் பேசுங்கள்.", "வெளியே நடந்து செல்லுங்கள்.", "உங்களை மென்மையாக நடத்துங்கள்."],
      Anxious: ["பொருட்களை கவனித்து மனதை ஒருமுகப்படுத்துங்கள்.", "மெதுவாக மூச்சு விடுங்கள்.", "ஒரு நேரத்தில் ஒரு வேலை மட்டும் செய்யுங்கள்."],
      Lonely: ["நீண்ட நாட்களாக பேசாத நண்பரை தொடர்பு கொள்ளுங்கள்.", "சிறு சந்திப்பை திட்டமிடுங்கள்.", "பிடித்த பொழுதுபோக்கில் ஈடுபடுங்கள்."]
    },
    riskExplanations: {
      'Low Concern': "இன்றைய முடிவுகள் இயல்பானவை. கவலைப்பட ஏதுமில்லை.",
      'Monitor': "சிறிய மாற்றங்கள் தெரிகின்றன. தொடர்ந்து செக்-இன் செய்யவும்.",
      'Elevated Concern': "மாற்றங்கள் கண்டறியப்பட்டுள்ளன. இது தொடர்ந்தால் மருத்துவரை அணுகவும்.",
      'High Concern': "குறிப்பிடத்தக்க மாற்றங்கள் உள்ளன. மருத்துவ ஆலோசனை பெறவும்."
    },
    biomarkers: {
      wordFindingSpeed: { Excellent: "வார்த்தைகளை மிக விரைவாகவும் தெளிவாகவும் கூறினீர்கள்.", Good: "வார்த்தைகளை கூறுவதில் சிறிய இடைவெளிகளே இருந்தன.", Fair: "சோர்வு காரணமாக வார்த்தைகளை தேட சிறிது நேரம் எடுத்தது.", 'Needs Attention': "வார்த்தைகளை நினைவுகூர்வதில் சிரமம் தெரிந்தது." },
      vocabularyDiversity: { Excellent: "மாறுபட்ட சொற்களைப் பயன்படுத்தினீர்கள்.", Good: "வார்த்தைகள் ஆரோக்கியமாகவும் இயற்கை மாறுபாட்டுடனும் இருந்தன.", Fair: "இன்று சொற்களின் பயன்பாடு சற்று குறைவாக இருந்தது.", 'Needs Attention': "சொற்கள் மிகவும் குறைவாகவே பயன்படுத்தப்பட்டன." },
      sentenceComplexity: { Excellent: "வாக்கியங்கள் மிகச் சிறப்பாகவும் தர்க்கரீதியாகவும் இருந்தன.", Good: "வாக்கியங்கள் தெளிவாகவும் நேர்த்தியாகவும் இருந்தன.", Fair: "வாக்கியங்கள் மிகவும் எளிமையாக இருந்தன.", 'Needs Attention': "வாக்கியங்கள் மிகவும் குறுகியதாக இருந்தன, இது சோர்வைக் காட்டுகிறது." },
      semanticCoherence: { Excellent: "கருத்துக்கள் மிகத் தர்க்கரீதியாக இணைக்கப்பட்டிருந்தன.", Good: "கருத்துக்கள் நன்றாக இணைக்கப்பட்டிருந்தன, தலைப்பிலேயே இருந்தீர்கள்.", Fair: "பேச்சின் போது தலைப்பில் இருந்து சற்று விலகினீர்கள்.", 'Needs Attention': "கருத்துக்கள் திடீரென மாறின, ஒத்திசைவு குறைவாக இருந்தது." },
      phonemicFluency: { Excellent: "உச்சரிப்பு மிகவும் தெளிவாகவும் சீராகவும் இருந்தது.", Good: "பேச்சு தெளிவாக இருந்தது, சிறிய தடுமாற்றங்களே இருந்தன.", Fair: "பேச்சில் சில தடுமாற்றங்கள் தெரிந்தன.", 'Needs Attention': "சோர்வு காரணமாக அதிக தடுமாற்றங்கள் இருந்தன." }
    },
    riskLabel: { 'Low Concern': '🟢 குறைந்த கவலை', 'Monitor': '🟡 கண்காணிக்கவும்', 'Elevated Concern': '🟠 மிதமான கவலை', 'High Concern': '🔴 அதிக கவலை' },
    trends: {
      stable: "பேச்சுத் தரம் சீராக உள்ளது",
      improved: "மதிப்பெண்கள் நேர்மறையாக மேம்பட்டுள்ளன",
      fatigue: "சோர்வுக்கான அறிகுறிகள் தெரிகின்றன",
      declined: "பேச்சு வேகம் சற்று குறைந்துள்ளது"
    },
    assistantText: "வணக்கம். இன்றைய பகுப்பாய்வு முடிந்தது. %SUMMARY% இன்று நீங்கள் %EMOTION% ஆக காணப்பட்டீர்கள். உங்கள் மதிப்பெண் %SCORE% ஆகும், இது முந்தைய அமர்வை விட %TREND% ஆகும். %RISK% பரிந்துரை: %ACTION% உடலை பார்த்துக் கொள்ளுங்கள்.",
    emotions: {
      Happy: 'மகிழ்ச்சியாக',
      Calm: 'அமைதியாக',
      Excited: 'உற்சாகமாக',
      Motivated: 'உந்துதலாக',
      Neutral: 'சமநிலையாக',
      Stressed: 'மன அழுத்தத்துடன்',
      Angry: 'கோபமாக',
      Sad: 'சோகமாக',
      Anxious: 'பதற்றமாக',
      Lonely: 'தனிமையாக'
    }
  },
  // te (Telugu)
  te: {
    emotionExplanations: {
      Happy: "మీరు చాలా ఉత్సాహంగా మరియు సంతోషంగా మాట్లాడారు. మీ స్వరం నిమ్మళంగా ఉంది.",
      Calm: "మీరు చాలా ప్రశాంతంగా మరియు నిదానంగా మాట్లాడారు. మీ ఆలోచనలు క్రమ పద్ధతిలో ఉన్నాయి.",
      Excited: "మీ మాటల్లో శక్తి మరియు ఉత్సాహం స్పష్టంగా కనిపించాయి.",
      Motivated: "మీరు ప్రేరణతో మరియు స్పష్టమైన లక్ష్యంతో కనిపించారు.",
      Neutral: "మీ స్వరం సాధారణంగా ఉంది. ఎలాంటి భావోద్వేగ మార్పులు లేవు.",
      Stressed: "మీరు కొంచెం ఒత్తిడిలో ఉన్నట్లు మీ మాటలు సూచిస్తున్నాయి. విశ్రాంతి తీసుకోండి.",
      Angry: "మీ స్వరంలో కోపం మరియు ఆందోళన కనిపించాయి. ప్రశాంతంగా ఉండటానికి ప్రయత్నించండి.",
      Sad: "మీ మాటల్లో విచారం కనిపించింది. మిమ్మల్ని మీరు జాగ్రత్తగా చూసుకోండి.",
      Anxious: "మీ మాటల్లో కంగారు మరియు ఆందోళన కనిపించాయి. శ్వాస వ్యాయామం చేయండి.",
      Lonely: "మీ సంభాషణలో ఒంటరితనం కనిపించింది."
    },
    summaries: {
      morning: "మీరు మీ ఉదయపు దినచర్య మరియు అల్పాహార వివరాలను పంచుకున్నారు.",
      childhood: "మీరు మీ చిన్ననాటి జ్ఞాపకాలను మరియు కుటుంబంతో గడిపిన క్షణాలను గుర్తుచేసుకున్నారు.",
      cook: "మీకు ఇష్టమైన వంటకం చేసే విధానాన్ని వివరంగా చెప్పారు.",
      beach: "మీకు ప్రశాంతతనిచ్చే ఒక అందమైన ప్రదేశం గురించి మాట్లాడారు.",
      family: "ఈ వారంలో మీకు సంతోషాన్నిచ్చిన విషయాల గురించి చర్చించారు.",
      default: "మీరు మీ దినచర్య మరియు జ్ఞాపకాల గురించి ఆలోచనాత్మకంగా పంచుకున్నారు."
    },
    whatThisMeans: {
      excellent: "మీ అభిజ్ఞా సూచీలు నేడు అద్భుతంగా ఉన్నాయి. మాటలు చాలా స్పష్టంగా ఉన్నాయి.",
      good: "మీ మాట్లాడే విధానం ఆరోగ్యకరంగా ఉంది. పదాలు మరియు శృతి స్థిరంగా ఉన్నాయి.",
      fair: "ఈ రోజు మాటల్లో కొంచెం అలసట కనిపించింది. విశ్రాంతి అవసరం.",
      needsAttention: "మాట్లాడే వేగం మరియు స్పష్టత తగ్గాయి. విశ్రాంతి తీసుకోవడం మంచిది."
    },
    actions: {
      Happy: ["మంచి విషయాలను మీ స్నేహితులతో పంచుకోండి.", "ఈ రోజు జరిగిన సంతోషకరమైన విషయాలను రాసుకోండి.", "మంచి అలవాట్లను కొనసాగించండి."],
      Calm: ["ఈ ప్రశాంతతను మంచి పనుల కోసం ఉపయోగించండి.", "ప్రకృతిలో కొంత సమయం గడపండి.", "ఆధ్యాత్మిక లేదా శ్వాస వ్యాయామం చేయండి."],
      Excited: ["మీ ఉత్సాహాన్ని మంచి పనులపై పెట్టండి.", "విశ్రాంతి తీసుకోవడం మర్చిపోకండి.", "ఆనందాన్ని పంచుకోండి."],
      Motivated: ["ఈ రోజు చేయాల్సిన పనిని నిర్ణయించుకుని ప్రారంభించండి.", "పనులను చిన్న భాగాలుగా విభజించండి.", "ఏకాగ్రత కోల్పోకండి."],
      Neutral: ["మీకు నచ్చిన ఒక చిన్న పనిని ఈ రోజు చేయండి.", "కొంచెం దూరం నడవండి.", "స్నేహితులతో మాట్లాడండి."],
      Stressed: ["స్క్రీన్లకు దూరంగా 5 నిమిషాలు విశ్రాంతి తీసుకోండి.", "మంచినీరు తాగి నిదానంగా శ్వాస తీసుకోండి.", "పనుల ఒత్తిడిని తగ్గించుకోండి."],
      Angry: ["కోపంగా ఉన్నప్పుడు సమాధానం చెప్పే ముందు నడవండి.", "శ్వాసపై దృష్టి పెట్టండి.", "ఏదైనా నిర్ణయం తీసుకునే ముందు 10 నిమిషాలు ఆగండి."],
      Sad: ["స్నేహితులు లేదా కుటుంబ సభ్యులతో మాట్లాడండి.", "బయట నడవండి.", "మీపై దయగా ఉండండి."],
      Anxious: ["మీ చుట్టూ ఉన్న వస్తువులను గమనించండి.", "నిదానంగా శ్వాస తీసుకోండి మరియు వదలండి.", "ఒకసారి ఒక పని మాత్రమే చేయండి."],
      Lonely: ["చాలా రోజుల నుంచి మాట్లాడని స్నేహితుడికి కాల్ చేయండి.", "ఒక చిన్న కలయికను ప్లాన్ చేయండి.", "నచ్చిన వ్యాపకంలో సమయం గడపండి."]
    },
    riskExplanations: {
      'Low Concern': "ఈ రోజు ఫలితాలు సాధారణంగా ఉన్నాయి. కంగారుపడాల్సిన అవసరం లేదు.",
      'Monitor': "కొద్దిపాటి మార్పులు కనిపిస్తున్నాయి. నిత్యం చెక్-ఇన్ చేయండి.",
      'Elevated Concern': "మార్పులు గుర్తించబడ్డాయి. ఇది కొనసాగితే వైద్యుడిని సంప్రదించండి.",
      'High Concern': "గమనార్హమైన మార్పులు ఉన్నాయి. తక్షణమే వైద్య సలహా తీసుకోండి."
    },
    biomarkers: {
      wordFindingSpeed: { Excellent: "మీరు పదాలను చాలా వేగంగా మరియు స్పష్టంగా గుర్తుకు తెచ్చుకున్నారు.", Good: "పదాలు చెప్పడంలో చిన్న విరామాలు మాత్రమే ఉన్నాయి.", Fair: "అలసట కారణంగా పదాల కోసం వెతకడానికి కొంచెం సమయం పట్టింది.", 'Needs Attention': "పదాలను గుర్తుకు తెచ్చుకోవడంలో స్పష్టమైన ఇబ్బంది కనిపించింది." },
      vocabularyDiversity: { Excellent: "మీరు సంభాషణలో చాలా గొప్ప పదజాలం ఉపయోగించారు.", Good: "పదాల శ్రేణి సహజంగా మరియు వైవిధ్యంగా ఉంది.", Fair: "ఈ రోజు పదాల వాడకం కొద్దిగా తక్కువగా ఉంది.", 'Needs Attention': "చాలా తక్కువ పదాలను ఉపయోగించడం జరిగింది." },
      sentenceComplexity: { Excellent: "వాక్యాలు చాలా బాగున్నాయి మరియు తార్కికంగా ఉన్నాయి.", Good: "వాక్యాలు స్పష్టంగా ఉన్నాయి. ఆలోచనలు క్రమ పద్ధతిలో ఉన్నాయి.", Fair: "వాక్యాలు చాలా సరళంగా ఉన్నాయి.", 'Needs Attention': "వాక్యాలు చాలా చిన్నవిగా ఉన్నాయి, ఇది అలసటను చూపిస్తుంది." },
      semanticCoherence: { Excellent: "ఆలోచనలు చాలా చక్కగా ఒకదానితో ఒకటి అనుసంధానించబడ్డాయి.", Good: "ఆలోచనలు బాగున్నాయి, మీరు ప్రధాన విషయానికే కట్టుబడి ఉన్నారు.", Fair: "సంభాషణ సమయంలో మీరు కొన్నిసార్లు ప్రధాన విషయం నుండి కొద్దిగా పక్కకు వెళ్లారు.", 'Needs Attention': "ఆలోచనలు అకస్మాత్తుగా మారాయి, పొంతన తక్కువగా ఉంది." },
      phonemicFluency: { Excellent: "ఉచ్ఛారణ చాలా స్పష్టంగా మరియు సులభంగా ఉంది.", Good: "మాటలు స్పష్టంగా ఉన్నాయి, చిన్న హిస్కిహిసాతాలు మాత్రమే ఉన్నాయి.", Fair: "మాటల్లో కొన్ని హిస్కిహిసాతాలు కనిపించాయి.", 'Needs Attention': "అలసట కారణంగా ఎక్కువ హిస్కిహిసాతాలు ఉన్నాయి." }
    },
    riskLabel: { 'Low Concern': '🟢 తక్కువ ఆందోళన', 'Monitor': '🟡 కనిపెట్టండి', 'Elevated Concern': '🟠 మధ్యస్థ ఆందోళన', 'High Concern': '🔴 తీవ్ర ఆందోళన' },
    trends: {
      stable: "మాట్లాడే శైలి స్థిరంగా ఉంది",
      improved: "స్కోర్లు సానుకూలంగా మెరుగయ్యాయి",
      fatigue: "అలసట సంకేతాలు కనిపిస్తున్నాయి",
      declined: "పదాల ప్రవాహం కొద్దిగా తగ్గింది"
    },
    assistantText: "నమస్కారం. ఈ రోజు విశ్లేషణ పూర్తయింది. %SUMMARY% ఈ రోజు మీరు %EMOTION% గా కనిపించారు. మీ స్కోరు %SCORE% గా ఉంది, ఇది గత సెషన్ కంటే %TREND% గా ఉంది. %RISK% మా సూచన: %ACTION% జాగ్రత్తగా ఉండండి.",
    emotions: {
      Happy: 'సంతోషంగా',
      Calm: 'ప్రశాంతంగా',
      Excited: 'ఉత్సాహంగా',
      Motivated: 'ప్రేరణతో',
      Neutral: 'సాధారణంగా',
      Stressed: 'ఒత్తిడితో',
      Angry: 'కోపంగా',
      Sad: 'విచారంగా',
      Anxious: 'కంగారుగా',
      Lonely: 'ఒంటరిగా'
    }
  }
};

// Copy over te for kn (Kannada) and ml (Malayalam) mapping dynamically with fallbacks
LOCALIZED_RESOURCES.kn = JSON.parse(JSON.stringify(LOCALIZED_RESOURCES.te));
LOCALIZED_RESOURCES.ml = JSON.parse(JSON.stringify(LOCALIZED_RESOURCES.te));

// Customize a few specific overrides for Kannada
LOCALIZED_RESOURCES.kn.assistantText = "ನಮಸ್ಕಾರ. ಇಂದಿನ ವಿಶ್ಲೇಷಣೆ ಮುಗಿದಿದೆ. %SUMMARY% ಇಂದು ನೀವು %EMOTION% ಆಗಿ ಕಾಣಿಸಿಕೊಂಡಿದ್ದೀರಿ. ನಿಮ್ಮ ಸ್ಕೋರ್ %SCORE% ಆಗಿದೆ, ಇದು ಕಳೆದ ಸೆಷನ್ಗಿಂತ %TREND% ಆಗಿದೆ. %RISK% ನಮ್ಮ ಸಲಹೆ: %ACTION% ಕಾಳಜಿ ವಹಿಸಿ.";
LOCALIZED_RESOURCES.kn.riskLabel = { 'Low Concern': '🟢 ಕಡಿಮೆ ಆತಂಕ', 'Monitor': '🟡 ಗಮನಿಸಿ', 'Elevated Concern': '🟠 ಮಧ್ಯಮ ಆತಂಕ', 'High Concern': '🔴 ತೀವ್ರ ಆತಂಕ' };

// Customize a few specific overrides for Malayalam
LOCALIZED_RESOURCES.ml.assistantText = "നമസ്കാരം. ഇന്നത്തെ വിശകലനം പൂർത്തിയായി. %SUMMARY% ഇന്ന് നിങ്ങൾ %EMOTION% ആയി കാണപ്പെട്ടു. നിങ്ങളുടെ സ്കോർ %SCORE% ആണ്, ഇത് കഴിഞ്ഞ സെഷനേക്കാൾ %TREND% ആണ്. %RISK% ഞങ്ങളുടെ നിർദ്ദേശം: %ACTION% ശ്രദ്ധിക്കുക.";
LOCALIZED_RESOURCES.ml.riskLabel = { 'Low Concern': '🟢 കുറഞ്ഞ ആശങ്ക', 'Monitor': '🟡 നിരീക്ഷിക്കുക', 'Elevated Concern': '🟠 മിതമായ ആശങ്ക', 'High Concern': '🔴 ഗുരുതരമായ ആശങ്ക' };

// ─── HELPER: generate mood trend for last 7 sessions ───
function generateMoodTrend(scores) {
  const moodPool = ['Happy', 'Calm', 'Happy', 'Calm', 'Neutral', 'Stressed', 'Calm'];
  const trend = moodPool.map((m, i) => ({ session: `Session ${22 + i}`, mood: m }));
  return trend;
}

// ─── HELPER: mood trend explanation ───
function getMoodTrendExplanation(trend, outputLang) {
  const stressCount = trend.filter(t => t.mood === 'Stressed' || t.mood === 'Anxious' || t.mood === 'Angry').length;
  const positiveCount = trend.filter(t => t.mood === 'Happy' || t.mood === 'Calm' || t.mood === 'Excited').length;

  const textDict = {
    en: {
      stress: "Your recent sessions show an elevated stress pattern. Consider reviewing your current load and practicing recovery habits.",
      positive: "Your mood has been mostly positive across the last week. Your emotional baseline looks healthy.",
      mixed: "Your mood has been mixed across recent sessions, with a generally stable pattern overall."
    },
    hi: {
      stress: "आपके हालिया सत्रों में बढ़ा हुआ तनाव देखा गया है। कृपया काम का बोझ कम करें और आराम के तरीकों पर ध्यान दें।",
      positive: "आपका मूड पिछले सप्ताह में ज्यादातर सकारात्मक रहा है। आपकी भावनात्मक स्थिति स्वस्थ दिखती है।",
      mixed: "हाल के सत्रों में आपका मूड मिला-जुला रहा है, कुल मिलाकर एक सामान्य और स्थिर पैटर्न है।"
    },
    es: {
      stress: "Sus sesiones recientes muestran una tendencia de estrés elevado. Considere descansar y tomar pausas.",
      positive: "Su estado de ánimo ha sido mayormente positivo esta semana. Sus marcadores se ven saludables.",
      mixed: "Su ánimo ha variado en las sesiones recientes, mostrando estabilidad general en promedio."
    },
    fr: {
      stress: "Vos dernières sessions indiquent un niveau de stress élevé. Pensez à lever le pied.",
      positive: "Votre humeur a été globalement très positive cette semaine. Votre équilibre émotionnel est bon.",
      mixed: "Votre humeur a été changeante récemment, avec une stabilité globale en moyenne."
    },
    ta: {
      stress: "உங்கள் பேச்சில் சோர்வும் அழுத்தமும் தெரிகிறது. மன அழுத்தத்தை குறைக்க ஓய்வெடுப்பது நல்லது.",
      positive: "கடந்த வாரத்தில் உங்கள் மனநிலை மிகவும் நன்றாக நேர்மறையாக இருந்தது. மனநலம் ஆரோக்கியமாக உள்ளது.",
      mixed: "முடிவுகள் சில மாற்றங்களுடன் இருந்தாலும் பொதுவாக சீராக உள்ளன."
    },
    te: {
      stress: "మీరు కొంచెం ఒత్తిడిలో ఉన్నట్లు మీ మాటలు సూచిస్తున్నాయి. విశ్రాంతి తీసుకోండి.",
      positive: "మీరు చాలా ఉత్సాహంగా మరియు సంతోషంగా మాట్లాడారు. మీ స్వరం నిమ్మళంగా ఉంది.",
      mixed: "మీ సంభాషణలలో స్వల్ప మార్పులు ఉన్నప్పటికీ, సాధారణంగా స్థిరంగా ఉన్నాయి."
    }
  };
  textDict.kn = textDict.te;
  textDict.ml = textDict.te;

  const dict = textDict[outputLang] || textDict.en;
  if (stressCount >= 3) return dict.stress;
  if (positiveCount >= 5) return dict.positive;
  return dict.mixed;
}

// ─── POST /api/conversation-followup ───
app.post('/api/conversation-followup', async (req, res) => {
  const { transcript, speechLanguage, aiReplyOption, uiLang } = req.body;
  
  let lang = 'en';
  if (speechLanguage && speechLanguage !== 'auto') {
    lang = speechLanguage.split('-')[0];
  } else {
    if (/[\u0900-\u097F]/.test(transcript)) lang = 'hi';
    else if (/[\u0B80-\u0BFF]/.test(transcript)) lang = 'ta';
    else if (/[\u0C00-\u0C7F]/.test(transcript)) lang = 'te';
    else if (/[\u0C80-\u0CFF]/.test(transcript)) lang = 'kn';
    else if (/[\u0D00-\u0D7F]/.test(transcript)) lang = 'ml';
  }

  const followUpQuestions = {
    en: "That's interesting. What is it about that experience that stands out most to you today?",
    hi: "यह बहुत दिलचस्प है। आज की इस घटना या विचार के बारे में आपको सबसे खास क्या लगा?",
    es: "Eso es interesante. ¿Qué es lo que más te llama la atención de esa experiencia hoy?",
    fr: "C'est intéressant. Qu'est-ce qui vous marque le plus dans cette expérience aujourd'hui ?",
    ta: "அது மிகவும் சுவாரஸ்யமானது. இன்று அந்த அனுபவத்தைப் பற்றி உங்களுக்கு மிகவும் ஆச்சரியமாக இருந்தது எது?",
    te: "అది చాలా ఆసక్తికరంగా ఉంది. ఈ రోజు ఆ అనుభవంలో మిమ్మల్ని బాగా ఆకట్టుకున్నది ఏమిటి?",
    kn: "ಅದು ತುಂಬಾ ಆಸಕ್ತಿದಾಯಕವಾಗಿದೆ. ಇಂದು ಆ ಅನುಭವದ ಬಗ್ಗೆ ನಿಮಗೆ ಹೆಚ್ಚು ಪ್ರಭಾವ ಬೀರಿದ್ದು ಯಾವುದು?",
    ml: "അത് വളരെ താല്പര്യമുണർത്തുന്നതാണ്. ആ അനുഭവത്തെക്കുറിച്ച് നിങ്ങൾക്ക് ഇന്ന് ഏറ്റവും പ്രത്യേകതയായി തോന്നിയത് എന്താണ്?"
  };

  const followUp = followUpQuestions[lang] || followUpQuestions.en;
  res.json({ followUpQuestion: followUp });
});

// ─── POST /api/analyze ───
app.post('/api/analyze', async (req, res) => {
  const { sessionId, duration, prompt, rawTranscript, avgConfidence, acousticMetrics, speechLanguage, aiReplyOption, uiLang } = req.body;

  // ── DEBUG LOGS: verify language preservation ──────────────────
  console.log('\n══════════════════════════════════════');
  console.log('RAW TRANSCRIPT:', rawTranscript);
  console.log('SPEECH LANGUAGE (from client):', speechLanguage);
  // ─────────────────────────────────────────────────────────────

  // Simulate AI analysis delay
  await new Promise((resolve) => setTimeout(resolve, 2500));

  const requestLang = speechLanguage && speechLanguage !== 'auto'
    ? speechLanguage.split('-')[0]
    : (uiLang || 'en');

  const transcript = rawTranscript && rawTranscript.trim().length > 0
    ? rawTranscript
    : generateTranscript(prompt || "Tell me about something that made you happy this week.", requestLang);

  const inputDuration = duration || 45;

  // 1. Language Detection & Configuration
  // Priority order:
  //   1st: Unicode script detection (most reliable when non-Latin script is present)
  //   2nd: speechLanguage BCP-47 tag from the Web Speech API recognizer
  //        (the recognizer lang IS the language — trust it)
  //   3rd: Roman-script word matching for Indian languages
  //   4th: Default to English

  let detectedLang = null;

  // ─ 1st: Unicode script ranges ────────────────────────────────────
  if (/[\u0900-\u097F]/.test(transcript)) detectedLang = 'hi';       // Devanagari
  else if (/[\u0B80-\u0BFF]/.test(transcript)) detectedLang = 'ta';  // Tamil
  else if (/[\u0C00-\u0C7F]/.test(transcript)) detectedLang = 'te';  // Telugu
  else if (/[\u0C80-\u0CFF]/.test(transcript)) detectedLang = 'kn';  // Kannada
  else if (/[\u0D00-\u0D7F]/.test(transcript)) detectedLang = 'ml';  // Malayalam

  // ─ 2nd: speechLanguage tag from the Web Speech API ─────────────
  // The recognizer itself was set to this language — it's the most
  // authoritative signal when no Unicode script characters are present
  // (e.g., Hindi transcribed as Roman/transliterated text).
  if (!detectedLang && speechLanguage && speechLanguage !== 'auto') {
    const slBase = speechLanguage.split('-')[0].toLowerCase();
    const knownLangs = ['hi', 'ta', 'te', 'kn', 'ml', 'es', 'fr', 'en'];
    if (knownLangs.includes(slBase)) {
      detectedLang = slBase;
    }
  }

  // ─ 3rd: Roman-script word matching for Latin-transcribed Indian languages ─
  if (!detectedLang) {
    const lower = transcript.toLowerCase();
    const words = lower.split(/\s+/);

    // Common Hindi words in Roman script
    const hiWords = ['main', 'mai', 'aaj', 'mujhe', 'hoon', 'hai', 'kya', 'nahi',
                     'bahut', 'achha', 'tha', 'yeh', 'woh', 'aur', 'lekin', 'kyunki',
                     'thoda', 'ghar', 'kaam', 'log', 'din', 'raat', 'subah', 'sham'];
    // Common Tamil words in Roman script
    const taWords = ['naan', 'ennakku', 'vandhen', 'poi', 'iniku', 'enna', 'romba',
                     'theriyum', 'illa', 'vanakkam', 'solren', 'paarunga', 'nalladu'];
    // Common Telugu words in Roman script
    const teWords = ['nenu', 'meeru', 'mee', 'naaku', 'chala', 'undi', 'ledhu',
                     'vachchaanu', 'ikkade', 'akkade', 'em', 'ela', 'ayindi'];

    const hiMatch = words.filter(w => hiWords.includes(w)).length;
    const taMatch = words.filter(w => taWords.includes(w)).length;
    const teMatch = words.filter(w => teWords.includes(w)).length;

    const esWords = ['el', 'la', 'los', 'que', 'en', 'es', 'un', 'una', 'con', 'por', 'para', 'como', 'bueno', 'día', 'tarde'];
    const frWords = ['le', 'la', 'les', 'que', 'en', 'et', 'est', 'un', 'une', 'avec', 'par', 'pour', 'bonjour', 'journée'];
    const esMatch = words.filter(w => esWords.includes(w)).length;
    const frMatch = words.filter(w => frWords.includes(w)).length;

    const max = Math.max(hiMatch, taMatch, teMatch, esMatch, frMatch);
    if (max >= 2) {
      if (hiMatch === max) detectedLang = 'hi';
      else if (taMatch === max) detectedLang = 'ta';
      else if (teMatch === max) detectedLang = 'te';
      else if (esMatch === max) detectedLang = 'es';
      else if (frMatch === max) detectedLang = 'fr';
    }
  }

  // ─ 4th: Fallback to English ───────────────────────────────────
  if (!detectedLang) detectedLang = 'en';

  // ── DEBUG LOGS: detected language and analysis input ─────────
  console.log('DETECTED LANGUAGE:', detectedLang);
  console.log('ANALYSIS INPUT (must equal RAW TRANSCRIPT):', transcript);
  console.log('MATCH:', rawTranscript === transcript ? '✅ YES – raw preserved' : '⚠️  NO – transcript was generated (no real input)');
  console.log('══════════════════════════════════════\n');
  // ─────────────────────────────────────────────────────────────

  // Determine output target language - strictly matching the detected spoken language
  const outputLang = detectedLang;
  const resResources = LOCALIZED_RESOURCES[outputLang] || LOCALIZED_RESOURCES.en;

  // 2. Perform raw linguistic analysis (uses transcript WITHOUT any cleaning/translation)
  let { scores, mindScore } = analyzeRawTranscript(transcript, inputDuration);

  // Dynamic Acoustic Metrics Adjustment
  let metricsPayload = {
    avgVolume: 0.12,
    volumeVariation: 0.04,
    pitchVariation: 35,
    pauseDuration: 2.8,
    pauseFrequency: 3.8,
    emotionalIntensity: 45
  };

  if (acousticMetrics) {
    metricsPayload = acousticMetrics;
    // High pause frequency impacts fluency and word speed scores
    if (acousticMetrics.pauseFrequency > 5.5) {
      scores.wordFindingSpeed = Math.max(30, scores.wordFindingSpeed - 8);
      scores.phonemicFluency = Math.max(30, scores.phonemicFluency - 6);
    }
    // High volume variance adds to speech complexity or vocabulary variance slightly
    if (acousticMetrics.emotionalIntensity > 75) {
      scores.phonemicFluency = Math.min(98, scores.phonemicFluency + 4);
    }
    // Recompute total mindScore based on modified subscores
    mindScore = parseFloat(((scores.wordFindingSpeed + scores.vocabularyDiversity + scores.sentenceComplexity + scores.semanticCoherence + scores.phonemicFluency) / 5).toFixed(1));
  }

  // Trend comparison
  const prevScores = generateSessionScores(28);
  const trend = parseFloat((mindScore - prevScores.mindScore).toFixed(1));

  // Compute emotion
  const cleanText = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  const wordsList = cleanText.trim().split(/\s+/).filter(w => w.length > 0);
  const wpm = wordsList.length / (inputDuration > 0 ? inputDuration / 60 : 0.75);
  const fillers = transcript.match(/\b(um|uh|hmm|well|like|ah|eh)\b/gi) || [];
  const fillerRate = wordsList.length > 0 ? fillers.length / wordsList.length : 0;
  const pauses = (transcript.match(/\.\.\.|[.,\/#!$%\^&\*;:{}=\-_`~()?]/g) || []).length;
  const pauseRate = wordsList.length > 0 ? pauses / wordsList.length : 0;
  const inputConfidence = avgConfidence || Math.floor(87 + Math.random() * 10);

  const { emotion, confidence: emotionConfidence } = detectEmotion(
    transcript,
    mindScore,
    wpm,
    fillerRate,
    pauseRate,
    metricsPayload
  );

  // Generate dynamic explanations fully localized
  const emotionExplanation = resResources.emotionExplanations[emotion] || resResources.emotionExplanations.Neutral;

  const statusForScores = (s) => (s >= 80 ? 'Excellent' : s >= 65 ? 'Good' : s >= 50 ? 'Fair' : 'Needs Attention');

  const biomarkerDetails = {
    wordFindingSpeed: {
      status: statusForScores(scores.wordFindingSpeed),
      explanation: resResources.biomarkers.wordFindingSpeed[statusForScores(scores.wordFindingSpeed)]
    },
    vocabularyDiversity: {
      status: statusForScores(scores.vocabularyDiversity),
      explanation: resResources.biomarkers.vocabularyDiversity[statusForScores(scores.vocabularyDiversity)]
    },
    sentenceComplexity: {
      status: statusForScores(scores.sentenceComplexity),
      explanation: resResources.biomarkers.sentenceComplexity[statusForScores(scores.sentenceComplexity)]
    },
    semanticCoherence: {
      status: statusForScores(scores.semanticCoherence),
      explanation: resResources.biomarkers.semanticCoherence[statusForScores(scores.semanticCoherence)]
    },
    phonemicFluency: {
      status: statusForScores(scores.phonemicFluency),
      explanation: resResources.biomarkers.phonemicFluency[statusForScores(scores.phonemicFluency)]
    }
  };

  const moodTrend = generateMoodTrend(scores);
  const moodTrendExplanation = getMoodTrendExplanation(moodTrend, outputLang);

  // Risk levels
  const negativeEmotions = ['Stressed', 'Angry', 'Sad', 'Anxious', 'Lonely'];
  const emotionPenalty = negativeEmotions.includes(emotion) ? -5 : 0;
  const adjusted = mindScore + emotionPenalty;
  let riskLevel = 'Low Concern';
  if (adjusted >= 75 && trend >= -3) riskLevel = 'Low Concern';
  else if (adjusted >= 60) riskLevel = 'Monitor';
  else if (adjusted >= 45) riskLevel = 'Elevated Concern';
  else riskLevel = 'High Concern';

  const riskExplanation = resResources.riskExplanations[riskLevel];
  const riskLabel = resResources.riskLabel[riskLevel];

  // Dynamic summary
  let summaryType = 'default';
  const cleanTranscript = transcript.toLowerCase();
  if (cleanTranscript.includes("grandparents") || cleanTranscript.includes("childhood") || cleanTranscript.includes("mango") || cleanTranscript.includes("bicycle")) {
    summaryType = 'childhood';
  } else if (cleanTranscript.includes("morning") || cleanTranscript.includes("routine") || cleanTranscript.includes("wake") || cleanTranscript.includes("coffee") || cleanTranscript.includes("tea")) {
    summaryType = 'morning';
  } else if (cleanTranscript.includes("cook") || cleanTranscript.includes("recipe") || cleanTranscript.includes("pasta") || cleanTranscript.includes("dal") || cleanTranscript.includes("biryani")) {
    summaryType = 'cook';
  } else if (cleanTranscript.includes("beach") || cleanTranscript.includes("visit") || cleanTranscript.includes("hill") || cleanTranscript.includes("village") || cleanTranscript.includes("scenic")) {
    summaryType = 'beach';
  } else if (cleanTranscript.includes("family") || cleanTranscript.includes("friend") || cleanTranscript.includes("happy") || cleanTranscript.includes("lunch") || cleanTranscript.includes("book")) {
    summaryType = 'family';
  }
  const summary = resResources.summaries[summaryType];

  // What this means
  let wtmType = 'good';
  if (mindScore >= 80) wtmType = 'excellent';
  else if (mindScore >= 68) wtmType = 'good';
  else if (mindScore >= 50) wtmType = 'fair';
  else wtmType = 'needsAttention';
  const whatThisMeans = resResources.whatThisMeans[wtmType];

  // Actions
  const actionsList = resResources.actions[emotion] || resResources.actions.Neutral;

  // Trend insights comparative
  const trendInsights = [];
  if (trend >= 2.5) {
    trendInsights.push(resResources.trends.improved);
  } else if (trend <= -2.5) {
    trendInsights.push(resResources.trends.declined);
  } else {
    trendInsights.push(resResources.trends.stable);
  }

  if (metricsPayload.pauseFrequency > 5.5) {
    trendInsights.push(resResources.trends.fatigue);
  }

  // Spoken response template replacement
  const trendTextLocales = {
    en: trend > 2 ? 'slightly improved compared to last time' : trend < -2 ? 'slightly lower than last time' : 'stable',
    hi: trend > 2 ? 'पिछली बार से थोड़ा बेहतर' : trend < -2 ? 'पिछली बार से थोड़ा कम' : 'पूरी तरह से स्थिर',
    es: trend > 2 ? 'ligeramente mejor' : trend < -2 ? 'ligeramente inferior' : 'estable',
    fr: trend > 2 ? 'en légère hausse' : trend < -2 ? 'en légère baisse' : 'stable',
    ta: trend > 2 ? 'முந்தைய அமர்வை விட மேம்பட்டுள்ளது' : trend < -2 ? 'முந்தைய அமர்வை விட சற்று குறைந்துள்ளது' : 'சீராக உள்ளது',
    te: trend > 2 ? 'గత సెషన్ కంటే కొంచెం మెరుగయింది' : trend < -2 ? 'గత సెషన్ కంటే కొంచెం తగ్గింది' : 'స్థిరంగా ఉంది',
  };
  trendTextLocales.kn = trendTextLocales.te;
  trendTextLocales.ml = trendTextLocales.te;

  const trendText = trendTextLocales[outputLang] || trendTextLocales.en;
  
function buildFormattedAssistantResponse(lang, emotion, trend, actionsList) {
  const moodMap = {
    en: {
      Happy: "You seem happy today.",
      Calm: "You seem calm today.",
      Excited: "You seem excited today.",
      Motivated: "You seem motivated today.",
      Neutral: "You seem balanced today.",
      Stressed: "You seem stressed today.",
      Angry: "You seem frustrated today.",
      Sad: "You seem a little down today.",
      Anxious: "You seem anxious today.",
      Lonely: "You seem a bit lonely today."
    },
    hi: {
      Happy: "आप आज खुश लग रहे हैं।",
      Calm: "आप आज शांत महसूस कर रहे हैं।",
      Excited: "आप आज काफी उत्साहित लग रहे हैं।",
      Motivated: "आप आज प्रेरित लग रहे हैं।",
      Neutral: "आप आज संतुलित लग रहे हैं।",
      Stressed: "आप आज कुछ तनाव में लग रहे हैं।",
      Angry: "आप आज थोड़े परेशान लग रहे हैं।",
      Sad: "आप आज थोड़े उदास लग रहे हैं।",
      Anxious: "आप आज कुछ चिंतित लग रहे हैं।",
      Lonely: "आप आज थोड़ा अकेलापन महसूस कर रहे हैं।"
    },
    es: {
      Happy: "Te ves feliz hoy.",
      Calm: "Te ves calmado hoy.",
      Excited: "Te ves emocionado hoy.",
      Motivated: "Te ves motivado hoy.",
      Neutral: "Te ves equilibrado hoy.",
      Stressed: "Te ves estresado hoy.",
      Angry: "Te ves frustrado hoy.",
      Sad: "Te ves un poco triste hoy.",
      Anxious: "Te ves ansioso hoy.",
      Lonely: "Te ves un poco solo hoy."
    },
    fr: {
      Happy: "Vous semblez heureux aujourd'hui.",
      Calm: "Vous semblez calme aujourd'hui.",
      Excited: "Vous semblez enthousiaste aujourd'hui.",
      Motivated: "Vous semblez motivé aujourd'hui.",
      Neutral: "Vous semblez équilibré aujourd'hui.",
      Stressed: "Vous semblez stressé aujourd'hui.",
      Angry: "Vous semblez frustré aujourd'hui.",
      Sad: "Vous semblez un peu triste aujourd'hui.",
      Anxious: "Vous semblez anxieux aujourd'hui.",
      Lonely: "Vous semblez un peu seul aujourd'hui."
    },
    ta: {
      Happy: "இன்று நீங்கள் மகிழ்ச்சியாகக் காணப்படுகிறீர்கள்.",
      Calm: "இன்று நீங்கள் அமைதியாகக் காணப்படுகிறீர்கள்.",
      Excited: "இன்று நீங்கள் உற்சாகமாகக் காணப்படுகிறீர்கள்.",
      Motivated: "இன்று நீங்கள் ஊக்கத்துடன் காணப்படுகிறீர்கள்.",
      Neutral: "இன்று நீங்கள் சாதாரணமாகக் காணப்படுகிறீர்கள்.",
      Stressed: "இன்று நீங்கள் மன அழுத்தத்துடன் காணப்படுகிறீர்கள்.",
      Angry: "இன்று நீங்கள் கோபமாகவோ வருத்தமாகவோ காணப்படுகிறீர்கள்.",
      Sad: "இன்று நீங்கள் சற்று சோகமாகக் காணப்படுகிறீர்கள்.",
      Anxious: "இன்று நீங்கள் பதற்றமாகக் காணப்படுகிறீர்கள்.",
      Lonely: "இன்று நீங்கள் தனிமையாகக் காணப்படுகிறீர்கள்."
    },
    te: {
      Happy: "ఈ రోజు మీరు సంతోషంగా కనిపిస్తున్నారు.",
      Calm: "ఈ రోజు మీరు ప్రశాంతంగా కనిపిస్తున్నారు.",
      Excited: "ఈ రోజు మీరు ఉత్సాహంగా కనిపిస్తున్నారు.",
      Motivated: "ఈ రోజు మీరు ప్రేరణతో కనిపిస్తున్నారు.",
      Neutral: "ఈ రోజు మీరు సమతుల్యంగా కనిపిస్తున్నారు.",
      Stressed: "ఈ రోజు మీరు ఒత్తిడిలో కనిపిస్తున్నారు.",
      Angry: "ఈ రోజు మీరు కోపంగా లేదా నిరాశగా కనిపిస్తున్నారు.",
      Sad: "ఈ రోజు మీరు కొంచెం విచారంగా కనిపిస్తున్నారు.",
      Anxious: "ఈ రోజు మీరు ఆందోళనగా కనిపిస్తున్నారు.",
      Lonely: "ఈ రోజు మీరు కొంచెం ఒంటరిగా కనిపిస్తున్నారు."
    },
    kn: {
      Happy: "ಇಂದು ನೀವು ಸಂತೋಷವಾಗಿ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Calm: "ಇಂದು ನೀವು ಪ್ರಶಾಂತವಾಗಿ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Excited: "ಇಂದು ನೀವು ಉತ್ಸಾಹದಿಂದ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Motivated: "ಇಂದು ನೀವು ಪ್ರೇರಿತರಾಗಿ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Neutral: "ಇಂದು ನೀವು ಸಮತೋಲನದಿಂದ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Stressed: "ಇಂದು ನೀವು ಒತ್ತಡದಲ್ಲಿ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Angry: "ಇಂದು ನೀವು ಕೋಪದಿಂದ ಅಥವಾ ನಿರಾಶೆಯಿಂದ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Sad: "ಇಂದು ನೀವು ಸ್ವಲ್ಪ ಬೇಸರದಿಂದ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Anxious: "ಇಂದು ನೀವು ಆತಂಕದಿಂದ ಕಾಣುತ್ತಿದ್ದೀರಿ.",
      Lonely: "ಇಂದು ನೀವು ಸ್ವಲ್ಪ ಒಂಟಿತನದಿಂದ ಕಾಣುತ್ತಿದ್ದೀರಿ."
    },
    ml: {
      Happy: "ഇന്ന് നിങ്ങൾ സന്തോഷവാനായി കാണപ്പെടുന്നു.",
      Calm: "ഇന്ന് നിങ്ങൾ ശാന്തനായി കാണപ്പെടുന്നു.",
      Excited: "ഇന്ന് നിങ്ങൾ ആവേശഭരിതനായി കാണപ്പെടുന്നു.",
      Motivated: "ഇന്ന് നിങ്ങൾ പ്രചോദിതനായി കാണപ്പെടുന്നു.",
      Neutral: "ഇന്ന് നിങ്ങൾ സമനിലയിൽ കാണപ്പെടുന്നു.",
      Stressed: "ഇന്ന് നിങ്ങൾ സമ്മർദ്ദത്തിൽ കാണപ്പെടുന്നു.",
      Angry: "ഇന്ന് നിങ്ങൾ കോപത്തിലോ നിരാശയിലോ കാണപ്പെടുന്നു.",
      Sad: "ഇന്ന് നിങ്ങൾ കുറച്ച് സങ്കടത്തിൽ കാണപ്പെടുന്നു.",
      Anxious: "ഇന്ന് നിങ്ങൾ ആശങ്കാകുലനായി കാണപ്പെടുന്നു.",
      Lonely: "ഇന്ന് നിങ്ങൾ കുറച്ച് ഒറ്റപ്പെട്ടതായി കാണപ്പെടുന്നു."
    }
  };

  const observationMap = {
    en: {
      stable: "Your communication remains stable compared to recent sessions.",
      improved: "Your cognitive clarity has improved nicely compared to recent sessions.",
      fatigue: "Your speaking patterns show slightly more fatigue compared to your baseline."
    },
    hi: {
      stable: "हाल के सत्रों की तुलना में आपकी बातचीत का प्रवाह स्थिर है।",
      improved: "पिछले सत्रों की तुलना में आपकी संज्ञानात्मक स्पष्टता में सुधार हुआ है।",
      fatigue: "आपके बोलने की गति हाल के दिनों की तुलना में कुछ थकान दर्शाती है।"
    },
    es: {
      stable: "Tu comunicación se mantiene estable en comparación con las sesiones recientes.",
      improved: "Tu claridad cognitiva ha mejorado en comparación con las sesiones recientes.",
      fatigue: "Tu ritmo de habla muestra algo de fatiga en comparación con tu base."
    },
    fr: {
      stable: "Votre communication reste stable par rapport aux sessions récentes.",
      improved: "Votre clarté cognitive s'est améliorée par rapport aux sessions récentes.",
      fatigue: "Votre débit de parole montre un peu de fatigue par rapport à d'habitude."
    },
    ta: {
      stable: "சமீபத்திய அமர்வுகளுடன் ஒப்பிடும்போது உங்கள் பேச்சுத் திறன் சீராக உள்ளது.",
      improved: "சமீபத்திய அமர்வுகளுடன் ஒப்பிடும்போது உங்கள் அறிவாற்றல் தெளிவு மேம்பட்டுள்ளது.",
      fatigue: "உங்கள் பேச்சு வேகம் முந்தைய அமர்வுகளை விட சற்று சோர்வாகக் காட்டுகிறது."
    },
    te: {
      stable: "ఇటీవలి సెషన్లతో పోలిస్తే మీ సంభాషణ స్థిరంగా ఉంది.",
      improved: "ఇటీవలి సెషన్లతో పోలిస్తే మీ సంభాషణలో స్పష్టత మెరుగయింది.",
      fatigue: "ఇటీవలి సెషన్లతో పోలిస్తే మీ సంభాషణలో కొంత అలసట కనిపిస్తోంది."
    },
    kn: {
      stable: "ಇತ್ತೀಚಿನ ಸೆಷನ್‌ಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ನಿಮ್ಮ ಸಂಭಾಷಣೆ ಸ್ಥಿರವಾಗಿದೆ.",
      improved: "ಇತ್ತೀಚಿನ ಸೆಷನ್‌ಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ನಿಮ್ಮ ಸಂಭಾಷಣೆಯಲ್ಲಿ ಸ್ಪಷ್ಟತೆ ಸುಧಾರಿಸಿದೆ.",
      fatigue: "ಇತ್ತೀಚಿನ ಸೆಷನ್‌ಗಳಿಗೆ ಹೋಲಿಸಿದರೆ ನಿಮ್ಮ ಮಾತಿನಲ್ಲಿ ಸ್ವಲ್ಪ ಆಯಾಸ ಕಾಣಿಸುತ್ತಿದೆ."
    },
    ml: {
      stable: "സമീപകാല സെഷനുകളുമായി താരതമ്യം ചെയ്യുമ്പോൾ നിങ്ങളുടെ സംഭാഷണം സ്ഥിരതയുള്ളതാണ്.",
      improved: "സമീപകാല സെഷനുകളുമായി താരതമ്യം ചെയ്യുമ്പോൾ നിങ്ങളുടെ സംഭാഷണം മെച്ചപ്പെട്ടിട്ടുണ്ട്.",
      fatigue: "സമീപകാല സെഷനുകളുമായി താരതമ്യം ചെയ്യുമ്പോൾ നിങ്ങളുടെ സംഭാഷണത്തിൽ കുറച്ച് ക്ഷീണം കാണുന്നുണ്ട്."
    }
  };

  const recMap = {
    en: {
      stable: "Keep maintaining your current routine.",
      relax: "Try to take a short break to rest and breathe deeply.",
      connect: "Consider connecting with a friend or doing something you enjoy."
    },
    hi: {
      stable: "अपनी वर्तमान दिनचर्या को जारी रखें।",
      relax: "आज थोड़ा आराम करने और गहरी सांस लेने की कोशिश करें।",
      connect: "आज किसी मित्र या प्रियजन से बात करने पर विचार करें।"
    },
    es: {
      stable: "Sigue manteniendo tu rutina actual.",
      relax: "Intenta tomarte un breve descanso para relajarte hoy.",
      connect: "Considera hacer algo que disfrutes o hablar con un ser querido."
    },
    fr: {
      stable: "Continuez à maintenir votre routine actuelle.",
      relax: "Essayez de faire une courte pause pour vous reposer et respirer profondément.",
      connect: "Pensez à faire quelque chose que vous aimez ou à parler à un proche."
    },
    ta: {
      stable: "உங்கள் தற்போதைய வழக்கத்தை அப்படியே தொடருங்கள்.",
      relax: "இன்று சிறிது நேரம் ஓய்வெடுத்து ஆழமாக மூச்சு விடுங்கள்.",
      connect: "உங்களுக்குப் பிடித்ததைச் செய்ய அல்லது அன்பானவரிடம் பேச யோசியுங்கள்."
    },
    te: {
      stable: "మీ ప్రస్తుత దినచర్యను కొనసాగించండి.",
      relax: "ఈ రోజు కొంచెం విశ్రాంతి తీసుకోండి.",
      connect: "మీకు నచ్చిన పని చేయండి లేదా స్నేహితులతో మాట్లాడండి."
    },
    kn: {
      stable: "ನಿಮ್ಮ ಪ್ರಸ್ತುತ ದಿನಚರಿಯನ್ನು ಮುಂದುವರಿಸಿ.",
      relax: "ಇಂದು ಸ್ವಲ್ಪ ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.",
      connect: "ನಿಮಗೆ ಇಷ್ಟವಾದ ಕೆಲಸ ಮಾಡಿ ಅಥವಾ ಸ್ನೇಹಿತರೊಂದಿಗೆ ಮಾತನಾಡಿ."
    },
    ml: {
      stable: "നിങ്ങളുടെ നിലവിലെ ദിനചര്യ തുടരുക.",
      relax: "ഇന്ന് കുറച്ചു സമയം വിശ്രാന്തി എടുക്കുക.",
      connect: "നിങ്ങൾക്ക് ഇഷ്ടമുള്ള കാര്യം ചെയ്യുക അല്ലെങ്കിൽ സുഹൃത്തുക്കളോട് സംസാരിക്കുക."
    }
  };

  const l = moodMap[lang] ? lang : 'en';
  const moodPart = moodMap[l][emotion] || moodMap[l].Neutral;

  let obsKey = 'stable';
  if (trend >= 2) obsKey = 'improved';
  else if (trend <= -2) obsKey = 'fatigue';
  const obsPart = observationMap[l][obsKey];

  let recKey = 'stable';
  if (['Stressed', 'Anxious', 'Angry'].includes(emotion)) recKey = 'relax';
  else if (['Sad', 'Lonely', 'Neutral'].includes(emotion)) recKey = 'connect';
  const recPart = recMap[l][recKey];

  return `${moodPart} ${obsPart} ${recPart}`;
}

  let assistantResponse = buildFormattedAssistantResponse(outputLang, emotion, trend, actionsList);

  res.json({
    sessionId: sessionId || `session-${Date.now()}`,
    scores,
    biomarkerDetails,
    mindScore,
    trend,
    txHash: generateTxHash(),
    blockNumber: 19847293 + Math.floor(Math.random() * 100),
    gasUsed: 21000 + Math.floor(Math.random() * 2000),
    timestamp: new Date().toISOString(),
    network: 'Ethereum Sepolia',
    contract: 'CognitiveVault.sol',
    transcript,
    rawTranscript: rawTranscript || transcript,
    transcriptConfidence: inputConfidence,
    emotion,
    emotionConfidence,
    emotionExplanation,
    summary,
    whatThisMeans,
    assistantResponse,
    actions: actionsList,
    moodTrend,
    moodTrendExplanation,
    risk: {
      level: riskLevel,
      color: riskLevel === 'Low Concern' ? 'green' : (riskLevel === 'Monitor' ? 'yellow' : (riskLevel === 'Elevated Concern' ? 'orange' : 'red')),
      explanation: riskExplanation,
      dot: riskLevel === 'Low Concern' ? '🟢' : (riskLevel === 'Monitor' ? '🟡' : (riskLevel === 'Elevated Concern' ? '🟠' : '🔴')),
      label: riskLabel
    },
    acousticMetrics: metricsPayload,
    trendInsights,
    detectedLanguage: detectedLang,
    outputLanguage: outputLang
  });
});

// GET /api/sessions
app.get('/api/sessions', (req, res) => {
  res.json({
    sessions: SESSIONS,
    total: SESSIONS.length,
    currentMindScore: SESSIONS[SESSIONS.length - 1].mindScore,
    trend30Day: parseFloat(
      ((SESSIONS[SESSIONS.length - 1].mindScore - SESSIONS[0].mindScore) / SESSIONS[0].mindScore * 100).toFixed(1)
    ),
    streak: 12,
  });
});

// GET /api/tokens
app.get('/api/tokens', (req, res) => {
  const earningHistory = [
    { date: new Date().toISOString(), activity: 'Daily check-in #28', mindEarned: 50, status: 'Confirmed', txHash: generateTxHash() },
    { date: new Date(Date.now() - 86400000).toISOString(), activity: '7-day streak bonus', mindEarned: 100, status: 'Confirmed', txHash: generateTxHash() },
    { date: new Date(Date.now() - 86400000).toISOString(), activity: 'Daily check-in #27', mindEarned: 50, status: 'Confirmed', txHash: generateTxHash() },
    { date: new Date(Date.now() - 86400000 * 2).toISOString(), activity: 'Daily check-in #26', mindEarned: 50, status: 'Confirmed', txHash: generateTxHash() },
    { date: new Date(Date.now() - 86400000 * 3).toISOString(), activity: 'Data marketplace reward', mindEarned: 150, status: 'Confirmed', txHash: generateTxHash() },
    { date: new Date(Date.now() - 86400000 * 3).toISOString(), activity: 'Daily check-in #25', mindEarned: 50, status: 'Confirmed', txHash: generateTxHash() },
    { date: new Date(Date.now() - 86400000 * 4).toISOString(), activity: 'Daily check-in #24', mindEarned: 50, status: 'Confirmed', txHash: generateTxHash() },
    { date: new Date(Date.now() - 86400000 * 5).toISOString(), activity: '30-day milestone bonus', mindEarned: 200, status: 'Confirmed', txHash: generateTxHash() },
  ];

  res.json({
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    ethBalance: '0.0847',
    mindBalance: 1240,
    earningHistory,
  });
});

// POST /api/grant-access
app.post('/api/grant-access', async (req, res) => {
  const { name, role } = req.body;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  res.json({
    success: true,
    accessId: `access-${Date.now()}`,
    nftTokenId: Math.floor(4000 + Math.random() * 2000),
    txHash: generateTxHash(),
    grantedAt: new Date().toISOString(),
  });
});

// POST /api/revoke-access
app.post('/api/revoke-access', async (req, res) => {
  const { accessId } = req.body;
  await new Promise((resolve) => setTimeout(resolve, 1200));
  res.json({
    success: true,
    accessId,
    txHash: generateTxHash(),
    revokedAt: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`\n🧠 MindMirror API Server running on http://localhost:${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST /api/analyze`);
  console.log(`   POST /api/conversation-followup`);
  console.log(`   GET  /api/sessions`);
  console.log(`   GET  /api/tokens`);
  console.log(`   POST /api/grant-access`);
  console.log(`   POST /api/revoke-access\n`);
});

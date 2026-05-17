"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";

const MBTI_GROUPS = {
  Analyst: {
    types: ["INTJ","INTP","ENTJ","ENTP"],
    color: "#8b5cf6",
    colorDim: "rgba(139,92,246,0.15)",
    colorGlow: "rgba(139,92,246,0.35)",
    colorBorder: "rgba(139,92,246,0.3)",
    gradientMesh: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(88,28,235,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.14) 0%, transparent 60%)",
    name: { en: "The Analysts", ar: "المحللون" },
    groupDesc: { en: "Electric Violet · Sovereign Intellect", ar: "البنفسجي الكهربائي · العقل السيادي" },
  },
  Diplomat: {
    types: ["INFJ","INFP","ENFJ","ENFP"],
    color: "#10b981",
    colorDim: "rgba(16,185,129,0.13)",
    colorGlow: "rgba(16,185,129,0.3)",
    colorBorder: "rgba(16,185,129,0.28)",
    gradientMesh: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(6,95,70,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(16,185,129,0.14) 0%, transparent 60%)",
    name: { en: "The Diplomats", ar: "الدبلوماسيون" },
    groupDesc: { en: "Emerald Green · Empathic Vision", ar: "الزمرد · الرؤية المتعاطفة" },
  },
  Sentinel: {
    types: ["ISTJ","ISFJ","ESTJ","ESFJ"],
    color: "#3b82f6",
    colorDim: "rgba(59,130,246,0.13)",
    colorGlow: "rgba(59,130,246,0.3)",
    colorBorder: "rgba(59,130,246,0.28)",
    gradientMesh: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(29,78,216,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(59,130,246,0.14) 0%, transparent 60%)",
    name: { en: "The Sentinels", ar: "الحراس" },
    groupDesc: { en: "Sapphire Blue · Structured Reliability", ar: "الياقوت · الموثوقية المنظمة" },
  },
  Explorer: {
    types: ["ISTP","ISFP","ESTP","ESFP"],
    color: "#f59e0b",
    colorDim: "rgba(245,158,11,0.13)",
    colorGlow: "rgba(245,158,11,0.3)",
    colorBorder: "rgba(245,158,11,0.28)",
    gradientMesh: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(180,83,9,0.22) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(245,158,11,0.14) 0%, transparent 60%)",
    name: { en: "The Explorers", ar: "المستكشفون" },
    groupDesc: { en: "Amber Gold · Adaptive Mastery", ar: "الذهب العنبري · الإتقان التكيفي" },
  },
};

function getMBTIType(axes) {
  const { IE, NS, TF, JP } = axes;
  return `${IE >= 0 ? "I" : "E"}${NS >= 0 ? "N" : "S"}${TF >= 0 ? "T" : "F"}${JP >= 0 ? "J" : "P"}`;
}

function getMBTIGroup(mbtiType) {
  for (const [key, group] of Object.entries(MBTI_GROUPS)) {
    if (group.types.includes(mbtiType)) return { key, ...group };
  }
  return { key: "Analyst", ...MBTI_GROUPS.Analyst };
}

// ─── ARCHETYPE DATA ───────────────────────────────────────────────────────────
const MBTI_ARCHETYPES = {
  INTJ: { icon: "♟", title: { en: "The Architect", ar: "المهندس المعماري" }, description: { en: "You don't just solve problems — you redesign the systems that create them. Your mind operates like a chess engine seventeen moves ahead, seeing patterns where others see chaos. Rare. Precise. Indomitable.", ar: "أنت لا تحل المشاكل فحسب — بل تُعيد تصميم الأنظمة التي أوجدتها. عقلك يعمل كمحرك شطرنج يرى سبعة عشر خطوة للأمام." }},
  INTP: { icon: "🔬", title: { en: "The Logician", ar: "المنطقي" }, description: { en: "You are a living engine of pure analysis. Every paradox is a feast, every contradiction an invitation. You pull reality apart at the seams just to understand the stitching.", ar: "أنت محرك حي من التحليل الخالص. كل مفارقة هي وليمة، كل تناقض دعوة. تفكك الواقع لتفهم نسيجه." }},
  ENTJ: { icon: "⚡", title: { en: "The Commander", ar: "القائد" }, description: { en: "You see inefficiency as an insult and ambiguity as a challenge to be resolved. Your reasoning is a blade — swift, decisive, and precisely calibrated to cut through confusion.", ar: "ترى عدم الكفاءة إهانة والغموض تحدياً يستوجب الحل. تفكيرك نصل — سريع وحاسم ومعايَر بدقة." }},
  ENTP: { icon: "🌀", title: { en: "The Debater", ar: "المناظر" }, description: { en: "You argue for positions you don't hold, just to stress-test the universe's ideas. Every paradox is a doorway and every rule a hypothesis waiting to be falsified.", ar: "تجادل عن مواقف لا تؤمن بها، فقط لاختبار أفكار الكون. كل مفارقة بوابة وكل قاعدة فرضية تنتظر الدحض." }},
  INFJ: { icon: "🌙", title: { en: "The Advocate", ar: "المناصر" }, description: { en: "You perceive the emotional architecture beneath every logical structure. Where others see equations, you sense destinies. Your insights arrive like prophecies — quiet, total, and irreversible.", ar: "تدرك البنية العاطفية تحت كل هيكل منطقي. حيث يرى الآخرون معادلات، تحس أنت بالمصائر." }},
  INFP: { icon: "✦", title: { en: "The Mediator", ar: "الوسيط" }, description: { en: "Every puzzle you solve is an act of empathy — you don't just compute answers, you feel them into existence. You are the rare mind that knows what the universe is trying to say.", ar: "كل لغز تحله هو فعل تعاطف — لا تحسب الإجابات فحسب، بل تستشعرها حتى تتجسد." }},
  ENFJ: { icon: "🌟", title: { en: "The Protagonist", ar: "البطل" }, description: { en: "You see every mind you encounter as a story waiting to be told — and you are its most attentive reader. Your reasoning is warm, catalytic, and always oriented toward what could be.", ar: "ترى كل عقل تلتقيه قصة تنتظر أن تُروى — وأنت قارئها الأكثر انتباهاً." }},
  ENFP: { icon: "🔥", title: { en: "The Campaigner", ar: "الحملاتي" }, description: { en: "You think in possibilities, not probabilities. Every question is a universe to inhabit briefly, turn inside out, and transcend. Your mind is a perpetual aurora — unpredictable, luminous, alive.", ar: "تفكر في الإمكانيات لا في الاحتمالات. كل سؤال كون تسكنه مؤقتاً ثم تتجاوزه." }},
  ISTJ: { icon: "🏛", title: { en: "The Logistician", ar: "اللوجستي" }, description: { en: "Your mind is a cathedral of earned certainty. You don't speculate — you verify. Every conclusion is a brick laid with care, and your edifice of understanding is built to last centuries.", ar: "عقلك كاتدرائية من اليقين المكتسب. لا تتكهن — تتحقق. كل استنتاج لبنة تُوضع بعناية." }},
  ISFJ: { icon: "🛡", title: { en: "The Defender", ar: "المدافع" }, description: { en: "You remember every detail because every detail matters to someone. Your logic is embedded in care — you reason not just to know, but to protect and preserve what is precious.", ar: "تتذكر كل التفاصيل لأن كل تفصيل مهم لشخص ما. منطقك مغمور بالرعاية — تتفكر لتحمي وتصون." }},
  ESTJ: { icon: "⚖", title: { en: "The Executive", ar: "المدير" }, description: { en: "Order is not a preference for you — it is a moral imperative. You see clearly where standards have failed and possess the rare will to restore them. Principled. Efficient. Uncompromising.", ar: "النظام بالنسبة لك ليس تفضيلاً — بل واجب أخلاقي. ترى بوضوح أين فشلت المعايير ولديك الإرادة النادرة لاستعادتها." }},
  ESFJ: { icon: "🤝", title: { en: "The Consul", ar: "القنصل" }, description: { en: "You experience logic as a social fabric — truth matters because it holds communities together. Your reasoning is always anchored to real human consequence, never abstract for its own sake.", ar: "تختبر المنطق كنسيج اجتماعي — الحقيقة مهمة لأنها تجمع المجتمعات. تفكيرك دائماً مربوط بالنتائج الإنسانية الحقيقية." }},
  ISTP: { icon: "⚙", title: { en: "The Virtuoso", ar: "المتقن" }, description: { en: "You learn by dismantling. Every system is a puzzle to be cracked, every machine a language to be spoken. You don't theorize — you reach in and find out.", ar: "تتعلم عن طريق التفكيك. كل نظام لغز يستحق الكشف، كل آلة لغة تستحق الإتقان." }},
  ISFP: { icon: "🎨", title: { en: "The Adventurer", ar: "المغامر" }, description: { en: "Your understanding is embodied — you know things through the texture of experience, not through abstraction. Where others diagram, you do. Where others theorize, you create.", ar: "فهمك مجسّد — تعرف الأشياء من ملمس التجربة لا من التجريد. حيث يرسم الآخرون، أنت تفعل." }},
  ESTP: { icon: "🎯", title: { en: "The Entrepreneur", ar: "ريادي الأعمال" }, description: { en: "You process reality at combat speed. While others are still reading the question, you have already mapped three solution paths and discarded two. Fast. Bold. Irreversibly present.", ar: "تعالج الواقع بسرعة المعركة. بينما يقرأ الآخرون السؤال، تكون قد رسمت ثلاثة مسارات حلول وأسقطت اثنين منها." }},
  ESFP: { icon: "🌈", title: { en: "The Entertainer", ar: "المسلّي" }, description: { en: "You don't just inhabit the present — you illuminate it. Your reasoning is alive with intuition, improvisation, and an electric attunement to what's actually happening right now.", ar: "لا تسكن الحاضر فحسب — بل تضيئه. تفكيرك حي بالحدس والارتجال والتناغم الكهربائي مع ما يحدث الآن." }},
};

// ─── PUZZLE BANK (25 deeply psychological questions with MBTI axis weights) ───
// weights: [IE, NS, TF, JP] per answer choice
// IE: positive=I, negative=E  |  NS: positive=N, negative=S  |  TF: positive=T, negative=F  |  JP: positive=J, negative=P
const PUZZLES = [
  // ═════════════ STAGE 1: THE BASELINE (Q1-5) ═════════════
  {
    id: 1,
    stage: 1,
    category: { en: "Logical Paradox", ar: "المفارقة المنطقية" },
    question: {
      en: "The Liar speaks: 'Everything I say is a lie.' Must this statement itself be a lie?",
      ar: "يتكلم الكاذب: 'كل ما أقوله كذب.' هل يجب أن تكون هذه الجملة ذاتها كذباً؟"
    },
    choices: {
      en: [
        "Yes — if the statement is true, it contradicts itself",
        "No — it could be the one true statement he makes",
        "The statement creates a self-referential loop with no resolution",
        "The question of truth doesn't apply — it's performative, not propositional"
      ],
      ar: [
        "نعم — إذا كانت صحيحة فهي تناقض نفسها",
        "لا — يمكن أن تكون الجملة الصحيحة الوحيدة التي يقولها",
        "الجملة تخلق حلقة ذاتية المرجعية دون حل",
        "مسألة الصدق لا تنطبق — إنها أدائية لا قضوية"
      ]
    },
    weights: [
      [+1, +1, +1, +1],   // A: I, N, T, J — systematic formal analysis
      [0, -1, 0, -1],      // B: S — literal, P — keeps options open
      [+1, +1, 0, -1],     // C: I, N — pattern recognition, P — unresolved comfort
      [0, +1, -1, -1],     // D: N — metalevel, F — ethics of language, P — refuses closure
    ],
    answer: 2,
    explanation: {
      en: "This is the Liar's Paradox — a genuine logical singularity. If true, it's false. If false, it must be true. Classical logic cannot resolve self-referential statements; they expose the incompleteness of any formal system.",
      ar: "هذه مفارقة الكاذب — شذوذ منطقي حقيقي. إذا كانت صحيحة فهي كاذبة. إذا كانت كاذبة فيجب أن تكون صحيحة. لا يستطيع المنطق الكلاسيكي حل العبارات ذاتية المرجعية."
    }
  },
  {
    id: 2,
    stage: 1,
    category: { en: "Ethical Dilemma", ar: "معضلة أخلاقية" },
    question: {
      en: "A surgeon can save five patients by harvesting the organs of one healthy, unwilling patient. The five will die without intervention. The one will die during the procedure. Is it morally permissible to proceed?",
      ar: "يمكن لجراح إنقاذ خمسة مرضى عن طريق أخذ أعضاء مريض واحد سليم وغير راضٍ. الخمسة سيموتون دون تدخل. الواحد سيموت خلال الإجراء. هل يجوز أخلاقياً المضي في ذلك؟"
    },
    choices: {
      en: [
        "Yes — the mathematics of suffering demand it: five lives outweigh one",
        "No — violating a person's bodily autonomy is an absolute moral boundary",
        "It depends on whether consent was given or could theoretically be obtained",
        "The framing itself is a trap — real ethics cannot be reduced to arithmetic"
      ],
      ar: [
        "نعم — رياضيات المعاناة تفرضه: خمسة أرواح تفوق روحاً واحدة",
        "لا — انتهاك استقلالية جسد الشخص حد أخلاقي مطلق",
        "يعتمد على ما إذا أُعطيت الموافقة أو أمكن الحصول عليها نظرياً",
        "الإطار نفسه هو الفخ — الأخلاق الحقيقية لا يمكن اختزالها في حسابات"
      ]
    },
    weights: [
      [-1, -1, +1, +1],   // A: E, S, T, J — utilitarian, decisive
      [+1, -1, -1, +1],   // B: I, S, F, J — principled deontology
      [0, +1, 0, -1],      // C: N, P — conditional, holds ambiguity
      [+1, +1, -1, -1],   // D: I, N, F, P — meta-ethical refusal
    ],
    answer: 3,
    explanation: {
      en: "The Transplant Problem (Judith Jarvis Thomson). Utilitarianism says 'yes' — but virtually everyone intuits 'no.' This reveals that our moral intuitions are deontological at their core: persons are ends, never means. The puzzle exposes that ethical theories often describe our intuitions rather than correct them.",
      ar: "مشكلة نقل الأعضاء (جوديث جارفيس تومسون). تقول النفعية 'نعم' — لكن معظمنا يحدس 'لا'. هذا يكشف أن حدسنا الأخلاقي الواجبي في جوهره: الأشخاص غايات وليسوا وسائل."
    }
  },
  {
    id: 3,
    stage: 1,
    category: { en: "Semantic Depth", ar: "العمق الدلالي" },
    question: {
      en: "The word 'CLEAVE' can mean both to split apart AND to cling together. If language is the house of being (Heidegger), what does a word that means its own opposite reveal?",
      ar: "كلمة 'CLEAVE' يمكن أن تعني الانفصال والتشبث في آنٍ واحد. إذا كانت اللغة بيت الوجود (هايدغر)، ماذا يكشف مصطلح يعني نقيضه؟"
    },
    choices: {
      en: [
        "Language is fundamentally arbitrary — words are labels, nothing more",
        "Opposites are not opposed — they share a deeper conceptual root (intensity of relation)",
        "Such words (contranyms) are evolutionary accidents, linguistically meaningless",
        "Being itself contains contradiction — language mirrors the dialectical structure of reality"
      ],
      ar: [
        "اللغة تعسفية في جوهرها — الكلمات مجرد تسميات",
        "الأضداد ليست متعارضة — تشترك في جذر مفاهيمي أعمق (كثافة العلاقة)",
        "مثل هذه الكلمات حوادث تطورية عرضية، لا معنى لغوي لها",
        "الوجود ذاته يحتوي على التناقض — اللغة تعكس البنية الجدلية للواقع"
      ]
    },
    weights: [
      [0, -1, +1, +1],   // A: S, T, J — literal, structural
      [+1, +1, 0, -1],   // B: I, N, P — pattern finding, non-closure
      [-1, -1, +1, +1],  // C: E, S, T, J — dismissive, systematic
      [+1, +1, -1, -1],  // D: I, N, F, P — philosophical depth, feeling
    ],
    answer: 3,
    explanation: {
      en: "Contranyms (auto-antonyms) like 'cleave,' 'sanction,' or 'dust' reveal that meaning is relational, not fixed. Heidegger was right: language does not merely describe reality — it constitutes it. A word holding opposites suggests reality itself is tensioned, not binary.",
      ar: "التضادات الذاتية مثل 'cleave' و'sanction' تكشف أن المعنى علائقي لا ثابت. كان هايدغر محقاً: اللغة لا تصف الواقع فحسب — بل تُشكّله."
    }
  },
  {
    id: 4,
    stage: 1,
    category: { en: "Cognitive Trap", ar: "فخ إدراكي" },
    question: {
      en: "You are offered two envelopes. One contains twice the money of the other. You pick one, see it has $100. Should you switch to the other envelope?",
      ar: "يُعرض عليك مظروفان. أحدهما يحتوي على ضعف المبلغ الموجود في الآخر. تختار أحدهما وترى أنه يحتوي $100. هل يجب أن تبادل إلى المظروف الآخر؟"
    },
    choices: {
      en: [
        "Yes — the other envelope has a 50% chance of containing $200, making switching rational",
        "No — switching doesn't change expected value; both choices are equivalent",
        "The problem is ill-posed — the paradox dissolves when you fix the prior distribution",
        "It depends on your risk tolerance and utility function, not pure probability"
      ],
      ar: [
        "نعم — المظروف الآخر لديه فرصة 50٪ لاحتوائه على $200، مما يجعل التبادل عقلانياً",
        "لا — التبادل لا يغير القيمة المتوقعة؛ كلا الخيارين متكافئان",
        "المسألة مصاغة بشكل خاطئ — المفارقة تتلاشى عند تثبيت التوزيع القبلي",
        "يعتمد على تحملك للمخاطرة ووظيفة المنفعة لديك، لا على الاحتمال الخالص"
      ]
    },
    weights: [
      [-1, -1, +1, -1],  // A: E, S, T, P — quick calculation, action
      [0, -1, +1, +1],   // B: S, T, J — literal expected value
      [+1, +1, +1, +1],  // C: I, N, T, J — formal analysis, constraint
      [+1, +1, -1, -1],  // D: I, N, F, P — contextual, personal
    ],
    answer: 2,
    explanation: {
      en: "The Two Envelope Paradox. The symmetry argument (switch is better) seems compelling but breaks down: you can't simultaneously define one envelope as having $100 and the other as 50% likely to have $50 or $200 without fixing the distribution. The paradox arises from improper probabilistic reasoning.",
      ar: "مفارقة المظروفين. حجة التماثل (التبادل أفضل) تبدو مقنعة لكنها تنهار: لا يمكنك تعريف مظروف بـ$100 والآخر باحتمال 50٪ دون تثبيت التوزيع. المفارقة تنشأ من استدلال احتمالي خاطئ."
    }
  },
  {
    id: 5,
    stage: 1,
    category: { en: "Phenomenology", ar: "الفينومينولوجيا" },
    question: {
      en: "Mary, a neuroscientist, has known every physical fact about color perception since birth — but has only ever seen black and white. The day she sees red for the first time, does she learn anything new?",
      ar: "تعلم ماري، عالمة الأعصاب، كل حقيقة فيزيائية عن إدراك اللون منذ الولادة — لكنها رأت الأبيض والأسود فقط. يوم ترى الأحمر لأول مرة، هل تتعلم شيئاً جديداً؟"
    },
    choices: {
      en: [
        "No — she already knows all the physical facts; there is nothing new",
        "Yes — she learns a qualitative experience (quale) that no physical description could capture",
        "The question assumes a false dichotomy between 'physical' and 'experiential' knowledge",
        "Whether she learns something new depends on whether consciousness is computational"
      ],
      ar: [
        "لا — هي تعرف بالفعل كل الحقائق الفيزيائية؛ لا شيء جديد",
        "نعم — تتعلم تجربة نوعية (quale) لا يمكن لأي وصف فيزيائي استيعابها",
        "السؤال يفترض ثنائية خاطئة بين المعرفة 'الفيزيائية' و'التجريبية'",
        "هل تتعلم شيئاً جديداً يعتمد على ما إذا كان الوعي حسابياً"
      ]
    },
    weights: [
      [0, -1, +1, +1],  // A: S, T, J — physicalist, reductionist
      [+1, +1, -1, -1], // B: I, N, F, P — qualia, phenomenal
      [+1, +1, 0, -1],  // C: I, N, P — dissolves dichotomy
      [0, +1, +1, 0],   // D: N, T — conditional, computational
    ],
    answer: 1,
    explanation: {
      en: "Frank Jackson's Knowledge Argument. Mary does learn something new — what it's LIKE to see red (the quale). This challenges physicalism: if knowing all physical facts doesn't capture qualia, consciousness cannot be fully reduced to physical processes. David Chalmers calls this the 'Hard Problem.'",
      ar: "حجة المعرفة لفرانك جاكسون. ماري تتعلم شيئاً جديداً — كيف يبدو رؤية الأحمر (النوعية). هذا يتحدى المادية: إذا لم تستوعب كل الحقائق الفيزيائية النوعيات، فلا يمكن اختزال الوعي في العمليات الفيزيائية."
    }
  },

  // ═════════════ STAGE 2: THE DEEPENING (Q6-15) ═════════════
  {
    id: 6,
    stage: 2,
    category: { en: "Formal Logic", ar: "المنطق الشكلي" },
    question: {
      en: "Gödel proved that in any consistent formal system powerful enough to describe arithmetic, there exist true statements that cannot be proven within that system. What does this mean for human reason itself?",
      ar: "أثبت جودل أنه في أي نظام رسمي متسق، توجد عبارات صحيحة لا يمكن إثباتها داخل النظام. ماذا يعني هذا للعقل البشري ذاته؟"
    },
    choices: {
      en: [
        "Human reason is fundamentally limited and cannot achieve complete self-knowledge",
        "It means nothing for human reason — Gödel applies only to formal mathematical systems",
        "Minds transcend formal systems — we can see truths that no machine could prove",
        "The incompleteness is a feature: it guarantees that inquiry is infinite and never exhausted"
      ],
      ar: [
        "العقل البشري محدود جوهرياً ولا يستطيع تحقيق معرفة ذاتية كاملة",
        "لا يعني شيئاً للعقل البشري — جودل ينطبق فقط على الأنظمة الرياضية الشكلية",
        "العقول تتجاوز الأنظمة الشكلية — نحن نرى حقائق لا يمكن لأي آلة إثباتها",
        "النقص ميزة: يضمن أن الاستفسار لا نهائي ولا ينضب أبداً"
      ]
    },
    weights: [
      [+1, +1, +1, +1],  // A: I, N, T, J — accepts systemic limits
      [0, -1, +1, +1],   // B: S, T, J — domain-restricted
      [-1, +1, -1, -1],  // C: E, N, F, P — transcendent view
      [+1, +1, -1, -1],  // D: I, N, F, P — finds beauty in openness
    ],
    answer: 2,
    explanation: {
      en: "Gödel's Incompleteness Theorems (1931) obliterated Hilbert's program — the dream of a complete, consistent mathematics. Lucas and Penrose argued minds transcend formal systems; Dennett and others disagree. The true implication: any sufficiently powerful system of thought contains truths it cannot reach from within itself.",
      ar: "مبرهنات جودل للاكتمال (1931) دمّرت برنامج هيلبرت. جادل لوكاس وبنروز بأن العقول تتجاوز الأنظمة الشكلية؛ دينيت وآخرون يختلفون. الحقيقة: أي نظام تفكير قوي يحتوي على حقائق لا يستطيع الوصول إليها من داخله."
    }
  },
  {
    id: 7,
    stage: 2,
    category: { en: "Identity & Metaphysics", ar: "الهوية والميتافيزيقا" },
    question: {
      en: "Ship of Theseus: A ship has every plank gradually replaced until none of the original material remains. Is it the same ship? Now imagine someone collects all the original planks and reassembles them — which ship is the 'real' one?",
      ar: "سفينة ثيسيوس: تُستبدل كل لوح في السفينة تدريجياً حتى لا تبقى أي مادة أصلية. هل هي نفس السفينة؟ الآن تخيل أن شخصاً جمع كل الألواح الأصلية وأعاد تجميعها — أي السفينتين 'الحقيقية'؟"
    },
    choices: {
      en: [
        "The repaired ship — identity is continuity of function and form, not material",
        "The reassembled ship — identity is material composition, not operational continuity",
        "Both are equally the original ship — identity is a useful fiction we project",
        "Neither — 'sameness' is a linguistic convenience that dissolves under scrutiny"
      ],
      ar: [
        "السفينة المُصلَحة — الهوية استمرارية الوظيفة والشكل، لا المادة",
        "السفينة المُعاد تجميعها — الهوية التركيب المادي، لا الاستمرارية التشغيلية",
        "كلتاهما السفينة الأصلية بالتساوي — الهوية وهم مفيد نسقطه",
        "لا هذه ولا تلك — 'التطابق' راحة لغوية تتلاشى تحت التدقيق"
      ]
    },
    weights: [
      [-1, -1, +1, +1],  // A: E, S, T, J — functionalist
      [0, -1, +1, +1],   // B: S, T, J — materialist
      [+1, +1, -1, -1],  // C: I, N, F, P — pragmatic fiction
      [+1, +1, -1, -1],  // D: I, N, F, P — radical dissolution
    ],
    answer: 2,
    explanation: {
      en: "Thomas Hobbes added the reassembly twist to Plutarch's original paradox, making it genuinely recursive. Functionalists say continuity = identity; mereologists say composition = identity. But both break down here. The deepest answer: identity is a narrative we impose, not a property things possess.",
      ar: "أضاف توماس هوبز التحول الإعادي التجميعية إلى مفارقة بلوتارخ الأصلية. الهوية سردية نفرضها، لا خاصية تمتلكها الأشياء."
    }
  },
  {
    id: 8,
    stage: 2,
    category: { en: "Emotional Logic", ar: "المنطق العاطفي" },
    question: {
      en: "A child asks you: 'If God is all-powerful, can He create a stone so heavy He cannot lift it?' You know there is no clean logical answer. Do you tell the child the truth?",
      ar: "يسألك طفل: 'إذا كان الله قادراً على كل شيء، هل يستطيع خلق حجر ثقيل لدرجة أنه لا يستطيع رفعه؟' تعرف أنه لا توجد إجابة منطقية نظيفة. هل تخبر الطفل بالحقيقة؟"
    },
    choices: {
      en: [
        "Yes — children deserve intellectual honesty; shielding them from paradox is paternalistic",
        "No — the emotional and developmental harm outweighs the epistemic benefit",
        "Reframe the question itself — the paradox dissolves if omnipotence is properly defined",
        "Turn it back: ask the child what they think, making discovery the answer"
      ],
      ar: [
        "نعم — الأطفال يستحقون الصدق الفكري؛ حجب المفارقة عنهم أبوية زائدة",
        "لا — الضرر العاطفي والتنموي يفوق الفائدة المعرفية",
        "أعد صياغة السؤال ذاته — المفارقة تتلاشى عند تعريف القدرة الكاملة بشكل صحيح",
        "اقلب الأمر: اسأل الطفل ماذا يعتقد، واجعل الاكتشاف هو الإجابة"
      ]
    },
    weights: [
      [-1, +1, +1, +1],  // A: E, N, T, J — radical honesty, principled
      [+1, -1, -1, +1],  // B: I, S, F, J — protective, warm
      [+1, +1, +1, +1],  // C: I, N, T, J — systematic redefinition
      [-1, +1, -1, -1],  // D: E, N, F, P — Socratic, open
    ],
    answer: 3,
    explanation: {
      en: "The Paradox of the Stone (Omnipotence Paradox). Aquinas resolved it by defining omnipotence as 'power over all things that are possible' — a stone too heavy to lift is logically incoherent, not a real limitation. But the deeper lesson here is pedagogical: how we answer shapes how children think about thinking.",
      ar: "مفارقة الحجر (مفارقة القدرة الكاملة). حلها الأكويني بتعريف القدرة الكاملة بـ'السيطرة على كل الممكنات'. لكن الدرس الأعمق هنا تربوي: كيف نجيب يشكّل كيف يفكر الأطفال في التفكير."
    }
  },
  {
    id: 9,
    stage: 2,
    category: { en: "Decision Theory", ar: "نظرية القرار" },
    question: {
      en: "Pascal's Wager: If God exists and you believe, you gain eternal bliss. If God doesn't exist and you believe, you lose little. Therefore, it is rational to believe in God. What is the fatal flaw in this argument?",
      ar: "رهان باسكال: إذا وُجد الله وآمنت، تنال السعادة الأبدية. إذا لم يوجد وآمنت، تخسر القليل. إذن الإيمان عقلاني. ما العيب القاتل في هذه الحجة؟"
    },
    choices: {
      en: [
        "Belief cannot be chosen voluntarily — you cannot decide to believe something",
        "The wager ignores the many-gods problem: which god, with which rules?",
        "Expected value calculations cannot apply to infinite quantities meaningfully",
        "All three objections are fatal simultaneously — the argument fails on multiple axes"
      ],
      ar: [
        "الإيمان لا يمكن اختياره طوعياً — لا يمكنك أن تقرر الإيمان بشيء",
        "الرهان يتجاهل مشكلة الآلهة المتعددة: أي إله، بأي قواعد؟",
        "حسابات القيمة المتوقعة لا يمكنها تطبيق الكميات اللانهائية بشكل ذي معنى",
        "الاعتراضات الثلاثة قاتلة في آنٍ واحد — الحجة تفشل على محاور متعددة"
      ]
    },
    weights: [
      [+1, -1, -1, -1],  // A: I, S, F, P — phenomenological
      [-1, +1, +1, -1],  // B: E, N, T, P — systematic multi-god
      [+1, +1, +1, +1],  // C: I, N, T, J — mathematical formalism
      [+1, +1, +1, -1],  // D: I, N, T, P — synthesizing
    ],
    answer: 3,
    explanation: {
      en: "All three objections cut deep. William James noted you can't will belief. Diderot's many-gods objection collapses the decision matrix. And infinite expected values mathematically swamp any finite comparison. The wager is elegant theater — but logically, it runs on empty.",
      ar: "الاعتراضات الثلاثة عميقة. لاحظ وليام جيمس أنك لا تستطيع إرادة الإيمان. اعتراض ديدرو للآلهة المتعددة يهدم مصفوفة القرار. والقيم المتوقعة اللانهائية تطغى رياضياً على أي مقارنة."
    }
  },
  {
    id: 10,
    stage: 2,
    category: { en: "Linguistic Recursion", ar: "التكرارية اللغوية" },
    question: {
      en: "Chomsky argued that the defining feature of human language is recursion — the ability to embed structures infinitely ('The cat that ate the rat that ate the cheese that sat on the mat...'). Everett disputes this in the Pirahã language. What does this debate reveal?",
      ar: "جادل تشومسكي بأن السمة المحددة للغة البشرية هي التكرارية — القدرة على دمج البنى بشكل لانهائي. يعارض إيفريت هذا في لغة البيراها. ماذا يكشف هذا النقاش؟"
    },
    choices: {
      en: [
        "Language is culturally contingent — no universal grammar exists",
        "The Pirahã exception is an anomaly that doesn't disprove universal grammar",
        "The debate reveals that language structure and world-structure are inseparably linked",
        "Both sides are partially right — universals exist, but their expression is culturally shaped"
      ],
      ar: [
        "اللغة مشروطة ثقافياً — لا توجد قواعد عالمية",
        "استثناء البيراها شذوذ لا يدحض القواعد العالمية",
        "النقاش يكشف أن بنية اللغة وبنية العالم مرتبطتان ارتباطاً لا يمكن فصله",
        "كلا الجانبين محق جزئياً — الكليات موجودة، لكن تعبيرها يتشكل ثقافياً"
      ]
    },
    weights: [
      [-1, +1, -1, -1],  // A: E, N, F, P — relativist
      [0, -1, +1, +1],   // B: S, T, J — conservative, formal
      [+1, +1, -1, -1],  // C: I, N, F, P — deep integration
      [+1, +1, 0, -1],   // D: I, N, P — pluralist synthesis
    ],
    answer: 3,
    explanation: {
      en: "The Pirahã language (documented by Everett) allegedly lacks recursion, color words, and creation myths — suggesting language reflects the world its speakers inhabit. Chomsky's universal grammar predicts otherwise. The truth may be that universals exist at a deeper level than surface syntax.",
      ar: "لغة البيراها (وثّقها إيفريت) تفتقر مزعوماً إلى التكرارية وكلمات الألوان والأساطير — مما يشير إلى أن اللغة تعكس العالم الذي يسكنه متحدثوها."
    }
  },
  {
    id: 11,
    stage: 2,
    category: { en: "Game Theory", ar: "نظرية الألعاب" },
    question: {
      en: "In the Prisoner's Dilemma repeated indefinitely, the winning strategy (Tit-for-Tat) is: cooperate first, then do whatever your partner did last time. What does this teach us about the emergence of morality?",
      ar: "في معضلة السجين المتكررة إلى ما لا نهاية، الاستراتيجية الفائزة هي: تعاون أولاً، ثم افعل ما فعله شريكك في المرة الأخيرة. ماذا يعلمنا هذا عن نشوء الأخلاق؟"
    },
    choices: {
      en: [
        "Morality is an emergent property of iterated self-interest — cooperation pays",
        "Morality cannot be reduced to game theory — genuine altruism exists beyond strategy",
        "The finding is irrelevant to real morality, which is about duty, not outcomes",
        "It suggests morality evolved as a genetic and cultural co-adaptation, not a rational choice"
      ],
      ar: [
        "الأخلاق خاصية ناشئة من المصلحة الذاتية المتكررة — التعاون يؤتي ثماره",
        "لا يمكن اختزال الأخلاق في نظرية الألعاب — الإيثار الحقيقي موجود خارج الاستراتيجية",
        "الاكتشاف غير ذي صلة بالأخلاق الحقيقية، التي تتعلق بالواجب لا بالنتائج",
        "يشير إلى أن الأخلاق تطورت كتكيف مشترك جيني وثقافي، لا كاختيار عقلاني"
      ]
    },
    weights: [
      [-1, -1, +1, +1],  // A: E, S, T, J — consequentialist emergence
      [+1, +1, -1, -1],  // B: I, N, F, P — genuine altruism
      [+1, -1, +1, +1],  // C: I, S, T, J — deontological
      [-1, +1, -1, -1],  // D: E, N, F, P — evolutionary naturalism
    ],
    answer: 0,
    explanation: {
      en: "Robert Axelrod's tournaments (1984) showed Tit-for-Tat dominates all strategies: start cooperative, punish defection, forgive quickly, be transparent. This suggests cooperation is not naive — it is the mathematically optimal long-term strategy. Morality may be evolution's solution to repeated social games.",
      ar: "أظهرت بطولات أكسيلرود (1984) أن 'مثلك بمثله' يتفوق على جميع الاستراتيجيات. هذا يشير إلى أن التعاون ليس سذاجة — إنه الاستراتيجية المثلى رياضياً على المدى الطويل."
    }
  },
  {
    id: 12,
    stage: 2,
    category: { en: "Phenomenological Ethics", ar: "الأخلاق الظاهراتية" },
    question: {
      en: "You discover that the person you love most has committed a grave historical injustice (before you met them). They are not the same person now. Do you leave?",
      ar: "تكتشف أن الشخص الذي تحبه أكثر ارتكب ظلماً تاريخياً جسيماً (قبل أن تلتقيه). إنه ليس نفس الشخص الآن. هل تغادر؟"
    },
    choices: {
      en: [
        "Yes — complicity by association, however indirect, is morally untenable",
        "No — people are defined by who they are, not by who they were",
        "It depends entirely on the nature and severity of the injustice",
        "The question cannot be answered abstractly — it dissolves only in the lived moment"
      ],
      ar: [
        "نعم — التواطؤ بالارتباط، مهما كان غير مباشر، غير مقبول أخلاقياً",
        "لا — يُعرَّف الناس بما هم عليه، لا بما كانوا عليه",
        "يعتمد كلياً على طبيعة الظلم وشدته",
        "لا يمكن الإجابة على السؤال بشكل مجرد — يتلاشى فقط في اللحظة المعاشة"
      ]
    },
    weights: [
      [-1, -1, +1, +1],  // A: E, S, T, J — principled, consequential
      [0, -1, -1, +1],   // B: S, F, J — pragmatic forgiveness
      [+1, +1, +1, -1],  // C: I, N, T, P — conditional
      [+1, +1, -1, -1],  // D: I, N, F, P — existential
    ],
    answer: 3,
    explanation: {
      en: "This question sits at the intersection of personal identity theory (is the past self the same as the present self?) and moral luck (Nagel). The truly honest answer acknowledges that abstract reasoning collapses in the face of genuine attachment — which itself is a philosophical datum.",
      ar: "هذا السؤال يقع عند تقاطع نظرية الهوية الشخصية والحظ الأخلاقي (ناغل). الإجابة الأكثر صدقاً تعترف بأن التفكير المجرد ينهار أمام الارتباط الحقيقي."
    }
  },
  {
    id: 13,
    stage: 2,
    category: { en: "Epistemic Humility", ar: "التواضع المعرفي" },
    question: {
      en: "Dunning and Kruger showed that incompetent people dramatically overestimate their ability, while experts underestimate theirs. What is the most rational response to knowing this?",
      ar: "أثبت دانينغ وكروغر أن الأشخاص غير الأكفاء يبالغون في تقدير قدرتهم، بينما يقللها الخبراء. ما الاستجابة الأكثر عقلانية لمعرفة هذا؟"
    },
    choices: {
      en: [
        "Systematically discount your own high-confidence beliefs as potential illusions",
        "Seek external calibration — compare your assessments to those of verified experts",
        "The effect is overstated; self-knowledge, while imperfect, is reliable enough to act on",
        "Recognize that both extremes are unavoidable features of any bounded rational mind"
      ],
      ar: [
        "تقليص معتقداتك عالية الثقة بشكل منهجي باعتبارها أوهاماً محتملة",
        "السعي إلى معايرة خارجية — قارن تقييماتك بتقييمات الخبراء الموثوقين",
        "التأثير مبالغ فيه؛ معرفة الذات، رغم نقصها، موثوقة بما يكفي للتصرف بناءً عليها",
        "الاعتراف بأن كلا الطرفين ميزة لا مفر منها لأي عقل عقلاني محدود"
      ]
    },
    weights: [
      [+1, +1, +1, +1],  // A: I, N, T, J — radical self-skepticism
      [-1, -1, +1, +1],  // B: E, S, T, J — external validation
      [-1, -1, +1, -1],  // C: E, S, T, P — pragmatic confidence
      [+1, +1, -1, -1],  // D: I, N, F, P — meta-cognitive acceptance
    ],
    answer: 1,
    explanation: {
      en: "The Dunning-Kruger effect suggests a meta-cognitive deficit: the skills needed to evaluate your performance are the same skills in which you are deficient. The most calibrated response is epistemic humility + external feedback loops. Knowing about the bias doesn't automatically correct it.",
      ar: "يشير تأثير دانينغ-كروغر إلى عجز معرفي-ميتا: المهارات اللازمة لتقييم أدائك هي نفس المهارات التي تفتقر إليها. أكثر استجابة معايَرة هي التواضع المعرفي + حلقات التغذية الراجعة الخارجية."
    }
  },
  {
    id: 14,
    stage: 2,
    category: { en: "Philosophy of Language", ar: "فلسفة اللغة" },
    question: {
      en: "Wittgenstein argued that the meaning of a word is its USE in a language game, not a private mental image. What follows from this for the concept of 'understanding'?",
      ar: "جادل فيتغنشتاين بأن معنى الكلمة هو استخدامها في لعبة لغوية، لا صورة ذهنية خاصة. ماذا يترتب على هذا لمفهوم 'الفهم'؟"
    },
    choices: {
      en: [
        "Understanding is a private, subjective inner state that language only imperfectly expresses",
        "Understanding is a disposition to use language correctly in a community — not a hidden inner event",
        "There is no such thing as understanding — only behavioral patterns that mimic it",
        "Language games are culturally relative, so understanding across cultures is fundamentally impossible"
      ],
      ar: [
        "الفهم حالة داخلية خاصة وذاتية لا تعبر عنها اللغة إلا بشكل ناقص",
        "الفهم استعداد لاستخدام اللغة بشكل صحيح في مجتمع — ليس حدثاً داخلياً خفياً",
        "لا يوجد شيء اسمه الفهم — فقط أنماط سلوكية تحاكيه",
        "الألعاب اللغوية نسبية ثقافياً، لذا الفهم عبر الثقافات مستحيل جوهرياً"
      ]
    },
    weights: [
      [+1, -1, -1, -1],  // A: I, S, F, P — Cartesian inner
      [-1, +1, +1, +1],  // B: E, N, T, J — communal behavioral
      [-1, -1, +1, +1],  // C: E, S, T, J — eliminativist
      [+1, +1, -1, -1],  // D: I, N, F, P — relativist
    ],
    answer: 1,
    explanation: {
      en: "Later Wittgenstein (Philosophical Investigations) attacked the idea of private language. Understanding is not a hidden mental click — it's manifested in practice, in the ability to go on. 'If a lion could talk, we could not understand him' — because the form of life differs entirely.",
      ar: "هاجم فيتغنشتاين المتأخر (تحقيقات فلسفية) فكرة اللغة الخاصة. الفهم ليس نقرة ذهنية خفية — إنه يتجلى في الممارسة، في القدرة على المضي قدماً."
    }
  },
  {
    id: 15,
    stage: 2,
    category: { en: "Cognitive Paradox", ar: "المفارقة المعرفية" },
    question: {
      en: "The Sorites Paradox: One grain of sand is not a heap. Adding one grain to a non-heap never creates a heap. Therefore, no amount of sand is a heap. Where does logic fail here?",
      ar: "مفارقة الكومة: حبة رمل واحدة ليست كومة. إضافة حبة واحدة إلى ما ليس كومة لا تخلق كومة أبداً. إذن لا يوجد مقدار من الرمل يشكل كومة. أين يفشل المنطق هنا؟"
    },
    choices: {
      en: [
        "The word 'heap' is vague — classical logic cannot handle vague predicates",
        "The inductive step is wrong — at some exact number, a heap does come into being",
        "We need fuzzy logic: truth comes in degrees between 0 and 1",
        "The paradox reveals that natural language is fundamentally incompatible with formal logic"
      ],
      ar: [
        "كلمة 'كومة' غامضة — المنطق الكلاسيكي لا يستطيع التعامل مع المسندات الغامضة",
        "الخطوة الاستقرائية خاطئة — عند عدد معين بالضبط، تنشأ الكومة",
        "نحتاج إلى المنطق الضبابي: الحقيقة تأتي بدرجات بين 0 و1",
        "المفارقة تكشف أن اللغة الطبيعية غير متوافقة جوهرياً مع المنطق الشكلي"
      ]
    },
    weights: [
      [+1, +1, -1, -1],  // A: I, N, F, P — vagueness tolerance
      [-1, -1, +1, +1],  // B: E, S, T, J — sharp boundary
      [+1, +1, +1, -1],  // C: I, N, T, P — formal alternative
      [+1, +1, -1, -1],  // D: I, N, F, P — meta-logical
    ],
    answer: 0,
    explanation: {
      en: "The Sorites Paradox (from 'soros' = heap) exposes the limits of classical bivalent logic when applied to vague predicates. Epistemicists (Williamson) say there IS a sharp boundary we simply don't know. Supervaluationists say truth is preserved across all sharpenings. Fuzzy logicians give 'heap' a gradient truth value. All three positions are defensible.",
      ar: "مفارقة الكومة تكشف حدود المنطق الثنائي الكلاسيكي عند تطبيقه على المسندات الغامضة. المعرفيون يقولون إن هناك حداً حاداً لا نعرفه فحسب. مناطقة الضباب يعطون 'الكومة' قيمة حقيقية تدريجية."
    }
  },

  // ═════════════ STAGE 3: THE CLIMAX (Q16-25) ═════════════
  {
    id: 16,
    stage: 3,
    category: { en: "Consciousness", ar: "الوعي" },
    question: {
      en: "The Hard Problem of Consciousness: Why does physical brain activity give rise to subjective experience at all? Why is there 'something it is like' to be conscious rather than pure information processing in the dark?",
      ar: "المشكلة الصعبة للوعي: لماذا تُفضي النشاطات الفيزيائية للدماغ إلى التجربة الذاتية؟ لماذا توجد 'كيفية كونك' واعياً بدلاً من معالجة معلومات في الظلام؟"
    },
    choices: {
      en: [
        "Consciousness is purely physical — it will be fully explained by future neuroscience",
        "Consciousness is fundamental — panpsychism suggests it is a basic feature of reality",
        "The Hard Problem is a pseudo-problem arising from confused intuitions about 'experience'",
        "We are constitutionally unable to solve it — our cognitive closure prevents self-understanding"
      ],
      ar: [
        "الوعي فيزيائي بحت — سيُشرح بالكامل من قبل علم الأعصاب المستقبلي",
        "الوعي أساسي — وحدة العقل والمادة تشير إلى أنه ميزة أساسية للواقع",
        "المشكلة الصعبة مشكلة زائفة تنشأ من حدوس مشوشة حول 'التجربة'",
        "نحن غير قادرين على حلها بطبيعتنا — إغلاقنا المعرفي يمنع الفهم الذاتي"
      ]
    },
    weights: [
      [-1, -1, +1, +1],  // A: E, S, T, J — reductionist
      [+1, +1, -1, -1],  // B: I, N, F, P — panpsychist/idealist
      [-1, +1, +1, -1],  // C: E, N, T, P — eliminativist
      [+1, +1, -1, -1],  // D: I, N, F, P — mysterian
    ],
    answer: 1,
    explanation: {
      en: "David Chalmers coined the 'Hard Problem' in 1995: explaining why brain processes generate subjective experience — not just how they produce behavior. Panpsychism (Goff) suggests consciousness is fundamental. Type-B physicalism (Chalmers' own later view) denies the explanatory gap is unbridgeable. No consensus exists.",
      ar: "صاغ ديفيد تشالمرز 'المشكلة الصعبة' عام 1995: تفسير سبب توليد عمليات الدماغ للتجربة الذاتية. وحدة العقل والمادة تقترح أن الوعي أساسي. لا يوجد توافق."
    }
  },
  {
    id: 17,
    stage: 3,
    category: { en: "Moral Geometry", ar: "الهندسة الأخلاقية" },
    question: {
      en: "Trolley Problem, maximum: A runaway trolley will kill five people. You can divert it to kill one. OR: you can push a large man off a bridge to stop the trolley, saving five. Most people say 'yes' to the switch and 'no' to the push. Why the moral difference — the math is identical?",
      ar: "مشكلة العربة القاتلة: عربة ستقتل خمسة. يمكنك تحويلها لقتل واحد. أو: يمكنك دفع رجل كبير من جسر لإيقاف العربة، مُنقذاً الخمسة. معظم الناس يقولون 'نعم' للتحويل و'لا' للدفع. لماذا الاختلاف الأخلاقي والرياضيات متطابقة؟"
    },
    choices: {
      en: [
        "Using a person as a means (the push) violates Kantian dignity in a way the switch does not",
        "The difference is emotional, not logical — both actions are equally permissible or impermissible",
        "The doctrine of double effect: the push intends the man's death; the switch only foresees it",
        "Our moral intuitions evolved for personal violence, not impersonal mechanisms — they misfire here"
      ],
      ar: [
        "استخدام شخص كوسيلة (الدفع) ينتهك الكرامة الكانطية بطريقة لا يفعلها التحويل",
        "الاختلاف عاطفي لا منطقي — كلا الفعلين مسموح بهما أو محظوران بالتساوي",
        "مذهب التأثير المزدوج: الدفع يقصد موت الرجل؛ التحويل يتوقعه فقط",
        "حدسنا الأخلاقي تطور للعنف الشخصي، لا للآليات غير الشخصية — إنه يخطئ هنا"
      ]
    },
    weights: [
      [+1, +1, +1, +1],  // A: I, N, T, J — Kantian deontology
      [-1, -1, +1, -1],  // B: E, S, T, P — consistent utilitarian
      [+1, +1, +1, +1],  // C: I, N, T, J — double effect
      [-1, +1, +1, -1],  // D: E, N, T, P — evolutionary debunking
    ],
    answer: 0,
    explanation: {
      en: "Joshua Greene's dual-process theory (fMRI studies): the switch activates rational circuits; the push activates emotional ones (disgust, personal violation). Judith Jarvis Thomson notes using someone's body as a trolley-stopper is categorically different from diverting a threat. The intuition may be tracking something real — not just misfiring.",
      ar: "نظرية العملية المزدوجة لجوشوا غرين (دراسات التصوير الوظيفي): التحويل يُنشط الدوائر العقلانية؛ الدفع ينشط العاطفية. قد يتتبع الحدس شيئاً حقيقياً."
    }
  },
  {
    id: 18,
    stage: 3,
    category: { en: "Existential Logic", ar: "المنطق الوجودي" },
    question: {
      en: "Sartre: 'Existence precedes essence' — you have no fixed nature, no predetermined purpose. You are condemned to be free. What is the most honest response to this?",
      ar: "سارتر: 'الوجود يسبق الماهية' — ليس لديك طبيعة ثابتة ولا غرض محدد مسبقاً. أنت محكوم عليك بالحرية. ما الاستجابة الأكثر صدقاً لهذا؟"
    },
    choices: {
      en: [
        "Radical freedom is terrifying — most people flee into 'bad faith' (self-deception about their freedom)",
        "Sartre is wrong — human nature exists, shaped by evolution, culture, and neurology",
        "Freedom is not a burden but the ground of all meaning — embrace it as creative possibility",
        "The question of essence vs. existence is ill-formed — we are always already embedded in a world"
      ],
      ar: [
        "الحرية الجذرية مرعبة — معظم الناس يهربون إلى 'سوء النية' (خداع ذاتي حول حريتهم)",
        "سارتر مخطئ — الطبيعة الإنسانية موجودة، تشكلها التطور والثقافة وعلم الأعصاب",
        "الحرية ليست عبئاً بل أرضية كل معنى — احتضنها كإمكانية إبداعية",
        "سؤال الماهية مقابل الوجود مصاغ بشكل سيئ — نحن دائماً منغمسون في عالم"
      ]
    },
    weights: [
      [+1, +1, -1, -1],  // A: I, N, F, P — psychologically honest
      [-1, -1, +1, +1],  // B: E, S, T, J — naturalist rebuttal
      [-1, +1, -1, -1],  // C: E, N, F, P — embrace freedom
      [+1, +1, +1, -1],  // D: I, N, T, P — Heideggerian throwness
    ],
    answer: 0,
    explanation: {
      en: "Sartre's 'bad faith' (mauvaise foi) is his diagnosis of how humans deny freedom — pretending to be fixed, role-defined, or determined. The waiter who performs 'being a waiter' too completely is in bad faith. Authentic existence requires owning your freedom and its consequent anguish.",
      ar: "سوء النية (mauvaise foi) عند سارتر تشخيصه لكيفية إنكار الإنسان حريته. الوجود الأصيل يستلزم امتلاك حريتك وقلقها المترتب."
    }
  },
  {
    id: 19,
    stage: 3,
    category: { en: "Simulation Theory", ar: "نظرية المحاكاة" },
    question: {
      en: "Nick Bostrom's Simulation Argument: if civilizations tend to survive long enough to run 'ancestor simulations,' we almost certainly live inside one. What is the most rigorous objection?",
      ar: "حجة بوستروم للمحاكاة: إذا كانت الحضارات تميل إلى النجاة طويلاً بما يكفي لتشغيل 'محاكاة الأسلاف'، فنحن نعيش على الأرجح داخل إحداها. ما الاعتراض الأكثر صرامة؟"
    },
    choices: {
      en: [
        "The physical resources required make ancestor simulations permanently impossible",
        "The argument is a category error — being simulated changes nothing about the reality of experience",
        "The prior that civilizations survive long enough is wildly speculative (the Great Filter)",
        "If we are simulated, the simulator is also likely simulated — infinite regress makes the argument meaningless"
      ],
      ar: [
        "الموارد الفيزيائية المطلوبة تجعل محاكاة الأسلاف مستحيلة إلى الأبد",
        "الحجة خطأ في الفئة — كوننا محاكاة لا يغير شيئاً في حقيقة التجربة",
        "القبلي بأن الحضارات تنجو طويلاً بما يكفي تخميني للغاية (المرشح العظيم)",
        "إذا كنا محاكاة، فالمحاكِي محتمل أن يكون محاكاة أيضاً — التراجع اللانهائي يجعل الحجة بلا معنى"
      ]
    },
    weights: [
      [-1, -1, +1, +1],  // A: E, S, T, J — physicalist rejection
      [+1, +1, -1, -1],  // B: I, N, F, P — phenomenal equivalence
      [+1, +1, +1, +1],  // C: I, N, T, J — probabilistic critique
      [-1, +1, +1, -1],  // D: E, N, T, P — recursive regress
    ],
    answer: 2,
    explanation: {
      en: "Bostrom's trilemma assumes civilizations survive AND want to run simulations AND can do so. The Great Filter (Hanson) suggests most civilizations perish before reaching post-human computation. The physical consciousness objection (Penrose) adds: if consciousness requires quantum gravity, no classical simulation captures it.",
      ar: "ثلاثية بوستروم تفترض أن الحضارات تنجو وتريد تشغيل محاكاة وتستطيع ذلك. المرشح العظيم يشير إلى أن معظم الحضارات تهلك قبل الحوسبة ما بعد الإنسانية."
    }
  },
  {
    id: 20,
    stage: 3,
    category: { en: "Semantic Paradox", ar: "المفارقة الدلالية" },
    question: {
      en: "Consider: 'The smallest positive integer not definable in fewer than thirteen words.' The phrase defining it uses exactly twelve words. Has the number just defined itself — or is the definition self-defeating?",
      ar: "انظر إلى: 'أصغر عدد صحيح موجب لا يمكن تعريفه بأقل من ثلاثة عشر كلمة.' العبارة المعرِّفة تستخدم اثنتي عشرة كلمة بالضبط. هل العدد عرّف نفسه للتو — أم أن التعريف يهزم ذاته؟"
    },
    choices: {
      en: [
        "The number has defined itself in twelve words — contradiction achieved",
        "The definition is self-defeating: if the number is definable in 12 words, it cannot be the smallest such number",
        "The paradox shows that 'definability' is not a well-formed predicate in any formal language",
        "It is a linguistic trick, not a genuine mathematical paradox"
      ],
      ar: [
        "العدد عرّف نفسه في اثنتي عشرة كلمة — تحقق التناقض",
        "التعريف يهزم ذاته: إذا كان العدد قابلاً للتعريف بـ12 كلمة، فلا يمكن أن يكون أصغر مثل هذا العدد",
        "المفارقة تُظهر أن 'القابلية للتعريف' ليست مسنداً محكماً في أي لغة شكلية",
        "إنها خدعة لغوية، لا مفارقة رياضية حقيقية"
      ]
    },
    weights: [
      [-1, +1, -1, -1],  // A: E, N, F, P — playful contradiction
      [+1, +1, +1, +1],  // B: I, N, T, J — formal self-defeat
      [+1, +1, +1, -1],  // C: I, N, T, P — metalinguistic
      [-1, -1, +1, +1],  // D: E, S, T, J — dismissive
    ],
    answer: 2,
    explanation: {
      en: "Berry's Paradox (Bertrand Russell). If such a number exists and is definable in 12 words, it cannot be 'the smallest NOT definable in fewer than 13 words.' The paradox arises from treating 'definability' as a predicate applicable to itself — the same root as Russell's set-theoretic paradox.",
      ar: "مفارقة بيري (راسل). إذا وُجد مثل هذا العدد وكان قابلاً للتعريف في 12 كلمة، فلا يمكن أن يكون 'أصغر غير قابل للتعريف في أقل من 13 كلمة'. تنشأ المفارقة من معاملة 'القابلية للتعريف' كمسند ينطبق على نفسه."
    }
  },
  {
    id: 21,
    stage: 3,
    category: { en: "The Ethics of Knowing", ar: "أخلاقيات المعرفة" },
    question: {
      en: "You have irrefutable evidence that a widely-held belief that gives millions of people comfort and purpose is factually false. Publishing it will cause widespread suffering. Do you publish?",
      ar: "لديك دليل دامغ على أن معتقداً راسخاً يمنح الملايين الراحة والهدف هو كذب واقعي. نشره سيسبب معاناة واسعة. هل تنشر؟"
    },
    choices: {
      en: [
        "Yes — truth has intrinsic value and its suppression is never justified",
        "No — consequences determine moral worth; unnecessary suffering is the greater evil",
        "Only if the belief is actively causing harm — otherwise, let comfort stand",
        "The question of 'who decides' is more important than the answer — epistemic paternalism is its own danger"
      ],
      ar: [
        "نعم — للحقيقة قيمة ذاتية ولا يُبرر قمعها أبداً",
        "لا — العواقب تحدد القيمة الأخلاقية؛ المعاناة غير الضرورية هي الشر الأعظم",
        "فقط إذا كان المعتقد يسبب ضرراً نشطاً — وإلا، دع الراحة تقف",
        "سؤال 'من يقرر' أهم من الإجابة — الأبوية المعرفية خطر بحد ذاتها"
      ]
    },
    weights: [
      [-1, +1, +1, +1],  // A: E, N, T, J — epistemic absolutist
      [-1, -1, -1, +1],  // B: E, S, F, J — utilitarian protector
      [+1, +1, -1, -1],  // C: I, N, F, P — conditional, contextual
      [+1, +1, -1, -1],  // D: I, N, F, P — meta-political concern
    ],
    answer: 3,
    explanation: {
      en: "W.K. Clifford insisted 'it is wrong always, everywhere, and for anyone, to believe anything upon insufficient evidence.' William James countered that belief has legitimate non-epistemic functions. The deepest issue here is epistemic autonomy: who authorized you to decide what others should know?",
      ar: "أصرّ كليفورد على أنه 'من الخطأ دائماً في كل مكان ولأي شخص أن يؤمن بأي شيء على أدلة غير كافية'. جيمس ردّ بأن الإيمان له وظائف غير معرفية مشروعة."
    }
  },
  {
    id: 22,
    stage: 3,
    category: { en: "Temporal Ethics", ar: "الأخلاق الزمنية" },
    question: {
      en: "Non-identity Problem (Parfit): Future people who will exist because of our decisions today cannot be harmed by those decisions — they would not exist otherwise. Does this mean we have no obligations to future generations?",
      ar: "مشكلة عدم الهوية (بارفيت): الناس المستقبليون الذين سيوجدون بسبب قراراتنا اليوم لا يمكن إلحاق الضرر بهم بهذه القرارات — إذ لن يوجدوا أصلاً. هل يعني هذا أنه لا توجد لدينا التزامات تجاه الأجيال القادمة؟"
    },
    choices: {
      en: [
        "Yes — you cannot harm someone by the very act that brings them into existence",
        "No — collective and systemic harms do not require identifiable individual victims",
        "The problem shows that person-affecting ethics is too narrow — we need impersonal principles",
        "Future people have rights independent of their origin — the non-identity logic is a sophism"
      ],
      ar: [
        "نعم — لا يمكنك إلحاق الضرر بشخص بالفعل الذي يُوجده",
        "لا — الأضرار الجماعية والمنهجية لا تتطلب ضحايا أفراداً محددين",
        "المشكلة تُظهر أن الأخلاق التي تؤثر على الشخص ضيقة للغاية — نحتاج إلى مبادئ غير شخصية",
        "للناس المستقبليين حقوق مستقلة عن أصلهم — منطق عدم الهوية سفسطة"
      ]
    },
    weights: [
      [-1, -1, +1, +1],  // A: E, S, T, J — strict logical
      [-1, +1, -1, -1],  // B: E, N, F, P — social systems
      [+1, +1, +1, -1],  // C: I, N, T, P — theoretical reform
      [+1, -1, -1, +1],  // D: I, S, F, J — intuition-preserving
    ],
    answer: 2,
    explanation: {
      en: "Parfit's Non-Identity Problem (Reasons and Persons, 1984) is devastating for person-affecting views. If X harms no identifiable person, is X wrong? Parfit concludes we need impersonal principles — policies are wrong if they make the world worse, even if no particular person is made worse off.",
      ar: "مشكلة عدم الهوية لبارفيت (أسباب وأشخاص، 1984) مدمرة للآراء التي تؤثر على الشخص. يستنتج بارفيت أننا بحاجة إلى مبادئ غير شخصية — السياسات خاطئة إذا جعلت العالم أسوأ، حتى لو لم يتضرر أي شخص بعينه."
    }
  },
  {
    id: 23,
    stage: 3,
    category: { en: "The Axiom of Choice", ar: "بديهية الاختيار" },
    question: {
      en: "The Axiom of Choice allows mathematicians to select one element from each of infinitely many sets simultaneously. It leads to the Banach-Tarski paradox: a sphere can be decomposed and reassembled into two identical spheres. What does this reveal about mathematics?",
      ar: "تتيح بديهية الاختيار للرياضيين اختيار عنصر من كل مجموعة من مجموعات لا نهائية في آن واحد. تؤدي إلى مفارقة بناخ-تارسكي: يمكن تحليل كرة وإعادة تجميعها لتصبح كرتين متطابقتين. ماذا يكشف هذا عن الرياضيات؟"
    },
    choices: {
      en: [
        "Mathematics is a human invention, not a discovery — its axioms are chosen for utility",
        "The Axiom of Choice is false — its paradoxical consequences prove it should be rejected",
        "The paradox shows that 'infinity' in mathematics cannot map cleanly onto physical reality",
        "The gap between mathematical truth and physical truth is total — they inhabit different ontological realms"
      ],
      ar: [
        "الرياضيات اختراع إنساني لا اكتشاف — تُختار بديهياتها لفائدتها",
        "بديهية الاختيار كاذبة — نتائجها المتناقضة تُثبت ضرورة رفضها",
        "المفارقة تُظهر أن 'اللانهاية' في الرياضيات لا تُرسم بنظافة على الواقع الفيزيائي",
        "الفجوة بين الحقيقة الرياضية والفيزيائية كاملة — كلتاهما تسكن مجالين وجوديين مختلفين"
      ]
    },
    weights: [
      [-1, +1, +1, -1],  // A: E, N, T, P — formalist/conventionalist
      [-1, -1, +1, +1],  // B: E, S, T, J — intuitionist rejection
      [+1, +1, +1, +1],  // C: I, N, T, J — structural insight
      [+1, +1, -1, -1],  // D: I, N, F, P — Platonist two-world
    ],
    answer: 2,
    explanation: {
      en: "The Banach-Tarski paradox works because the 'decomposition' uses non-measurable sets — structures that have no physical counterpart. This reveals a deep truth: mathematical existence and physical existence are not the same. The Axiom of Choice is independent of ZF set theory — neither provable nor disprovable from the other axioms.",
      ar: "تعمل مفارقة بناخ-تارسكي لأن 'التحليل' يستخدم مجموعات غير قابلة للقياس — هياكل ليس لها نظير فيزيائي. هذا يكشف حقيقة عميقة: الوجود الرياضي والوجود الفيزيائي ليسا متطابقين."
    }
  },
  {
    id: 24,
    stage: 3,
    category: { en: "The Limits of Reason", ar: "حدود العقل" },
    question: {
      en: "Kant: our minds impose categories (space, time, causality) on raw experience. We never perceive the 'thing-in-itself' (Ding an sich) — only our structured representation of it. What follows?",
      ar: "كانط: عقولنا تفرض فئات (المكان والزمان والسببية) على التجربة الخام. لا ندرك أبداً 'الشيء في ذاته' (Ding an sich) — فقط تمثيلنا المنظم له. ماذا يترتب على ذلك؟"
    },
    choices: {
      en: [
        "Science describes only appearances — reality-in-itself is permanently beyond reach",
        "Kant is wrong — quantum mechanics and relativity have accessed deeper structures of reality",
        "The categories are evolutionary adaptations, not transcendental — they could have been otherwise",
        "The distinction between 'appearance' and 'thing-in-itself' is itself incoherent — Hegel was right"
      ],
      ar: [
        "العلم يصف المظاهر فقط — الواقع في ذاته خارج نطاق الوصول إلى الأبد",
        "كانط مخطئ — ميكانيكا الكم والنسبية وصلت إلى بنى أعمق للواقع",
        "الفئات تكيفات تطورية لا متعالية — كان يمكن أن تكون مختلفة",
        "التمييز بين 'المظهر' و'الشيء في ذاته' هو نفسه غير متماسك — هيغل كان محقاً"
      ]
    },
    weights: [
      [+1, +1, +1, +1],  // A: I, N, T, J — Kantian acceptance
      [-1, -1, +1, +1],  // B: E, S, T, J — scientific realist
      [-1, +1, +1, -1],  // C: E, N, T, P — evolutionary epistemology
      [+1, +1, -1, -1],  // D: I, N, F, P — Hegelian idealism
    ],
    answer: 0,
    explanation: {
      en: "Kant's Copernican Revolution: instead of asking how mind conforms to objects, ask how objects conform to mind. The categories are not optional — they constitute experience itself. The thing-in-itself remains beyond all possible knowledge. This is not pessimism — it is the precise delineation of the reach of human reason.",
      ar: "الثورة الكوبرنيكية لكانط: بدلاً من سؤال كيف يتوافق العقل مع الأشياء، اسأل كيف تتوافق الأشياء مع العقل. الفئات ليست اختيارية — تُشكّل التجربة ذاتها."
    }
  },
  {
    id: 25,
    stage: 3,
    category: { en: "The Final Question", ar: "السؤال الأخير" },
    question: {
      en: "After engaging with 24 puzzles at the edge of logic, language, consciousness, and ethics — what is the most honest thing you can say about the nature of your own understanding?",
      ar: "بعد الانخراط في 24 لغزاً على حافة المنطق واللغة والوعي والأخلاق — ما أصدق شيء يمكنك قوله عن طبيعة فهمك الخاص؟"
    },
    choices: {
      en: [
        "I understand more than I did before — knowledge accumulates and so does clarity",
        "The deeper I go, the more I realize how much I do not and cannot know",
        "Understanding is a process, not a destination — the question itself is the answer",
        "My understanding is always already provisional — every certainty conceals an assumption"
      ],
      ar: [
        "أفهم أكثر مما كنت عليه — المعرفة تتراكم وكذلك الوضوح",
        "كلما تعمقت، أدركت أكثر كم لا أعرف ولا أستطيع المعرفة",
        "الفهم عملية لا وجهة — السؤال ذاته هو الإجابة",
        "فهمي دائماً مؤقت — كل يقين يخفي افتراضاً"
      ]
    },
    weights: [
      [-1, -1, +1, +1],  // A: E, S, T, J — confident accumulation
      [+1, +1, -1, -1],  // B: I, N, F, P — Socratic humility
      [+1, +1, -1, -1],  // C: I, N, F, P — process philosophy
      [+1, +1, +1, -1],  // D: I, N, T, P — provisional knowledge
    ],
    answer: 1,
    explanation: {
      en: "Socrates: 'I know that I know nothing.' This is not nihilism but epistemic maturity — the recognition that the more precisely you define the frontier of your knowledge, the more clearly you see the vast unknown beyond it. The wisest thing a mind can do is map the shape of its own ignorance.",
      ar: "سقراط: 'أعلم أنني لا أعلم شيئاً.' هذا ليس عدمية بل نضجاً معرفياً — الاعتراف بأنك كلما حددت حدود معرفتك بدقة أكبر، رأيت بشكل أوضح المجهول الشاسع ما وراءها."
    }
  },
];

// ─── AUDIO ENGINE (Web Audio API — pure, no deps) ─────────────────────────────
function createAudioEngine() {
  let ctx = null;
  let masterGain = null;
  let droneNodes = [];
  let isRunning = false;

  const getCtx = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.0, ctx.currentTime);
      masterGain.connect(ctx.destination);
    }
    return ctx;
  };

  const createDrone = (freq, gainVal, detune = 0) => {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, c.currentTime);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, c.currentTime);
    osc.detune.setValueAtTime(detune, c.currentTime);
    g.gain.setValueAtTime(gainVal, c.currentTime);
    osc.connect(filter);
    filter.connect(g);
    g.connect(masterGain);
    osc.start();
    return { osc, g, filter };
  };

  const fadeToGain = (targetGain, duration = 2.0) => {
    if (!masterGain) return;
    masterGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + duration);
  };

  const stopAll = () => {
    droneNodes.forEach(n => { try { n.osc.stop(); } catch(e) {} });
    droneNodes = [];
    isRunning = false;
  };

  return {
    start(stage) {
      const c = getCtx();
      if (c.state === "suspended") c.resume();
      stopAll();

      // Stage 1: ultra-minimalist drone (55Hz root + 5th)
      if (stage === 1) {
        droneNodes = [
          createDrone(55, 0.08),
          createDrone(82.4, 0.04, -3),
          createDrone(110, 0.025, 5),
        ];
        fadeToGain(0.55, 2.5);
      }
      // Stage 2: warm contemplative layers
      else if (stage === 2) {
        droneNodes = [
          createDrone(55, 0.09),
          createDrone(82.4, 0.06, -2),
          createDrone(110, 0.04, 4),
          createDrone(164.8, 0.025, -5),
          createDrone(220, 0.015, 3),
        ];
        fadeToGain(0.65, 2.0);
      }
      // Stage 3: intense cinematic pads
      else if (stage === 3) {
        droneNodes = [
          createDrone(41.2, 0.1),
          createDrone(55, 0.09, -4),
          createDrone(82.4, 0.07, 6),
          createDrone(110, 0.05, -2),
          createDrone(164.8, 0.04, 3),
          createDrone(220, 0.03, -6),
          createDrone(329.6, 0.015, 2),
        ];
        fadeToGain(0.75, 1.8);
      }
      isRunning = true;
    },

    playChime() {
      const c = getCtx();
      // Glass chime: sine wave at high freq, quick decay
      [1047, 1318.5, 1568].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, c.currentTime);
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.01 + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.8 + i * 0.1);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(c.currentTime + i * 0.07);
        osc.stop(c.currentTime + 1.2);
      });
    },

    playError() {
      const c = getCtx();
      // Low rumble: two detuned sines dropping in pitch
      [80, 75].forEach((freq, i) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq + i * 3, c.currentTime);
        osc.frequency.linearRampToValueAtTime(40, c.currentTime + 0.4);
        g.gain.setValueAtTime(0.15, c.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
        const filter = c.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(300, c.currentTime);
        osc.connect(filter);
        filter.connect(g);
        g.connect(ctx.destination);
        osc.start();
        osc.stop(c.currentTime + 0.6);
      });
    },

    transitionStage(stage) {
      if (!isRunning) return;
      const c = getCtx();
      fadeToGain(0.1, 1.0);
      setTimeout(() => {
        stopAll();
        this.start(stage);
      }, 1200);
    },

    stop() { fadeToGain(0, 1.5); setTimeout(stopAll, 1600); },
    isRunning() { return isRunning; },
  };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PuzzleApp() {
  // ── State ──
  const [lang, setLang] = useState("en");
  const [phase, setPhase] = useState("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [axes, setAxes] = useState({ IE: 0, NS: 0, TF: 0, JP: 0 });
  const [shake, setShake] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitching, setGlitching] = useState(false);
  const [audioOn, setAudioOn] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  // ── Background music toggle state (separate from SFX engine) ──
  const [bgMusicOn, setBgMusicOn] = useState(false);
  const [scratchpadOpen, setScratchpadOpen] = useState(false);
  const [scratchText, setScratchText] = useState("");
  const [mbtiResult, setMbtiResult] = useState(null);
  const [mbtiGroup, setMbtiGroup] = useState(null);
  const [themeTransitioned, setThemeTransitioned] = useState(false);

  const containerRef = useRef(null);
  const audioRef = useRef(null);
  // ── Ref for the HTML5 background music element ──
  const bgMusicRef = useRef(null);

  // ── Derived ──
  const isRTL = lang === "ar";
  const puzzle = PUZZLES[currentIdx];
  const currentStage = puzzle?.stage ?? 1;
  const pct = Math.round((currentIdx / PUZZLES.length) * 100);
  const t = useCallback((obj) => (typeof obj === "object" && obj !== null ? obj[lang] : obj), [lang]);

  // ── Audio engine init ──
  useEffect(() => {
    audioRef.current = createAudioEngine();
    return () => { audioRef.current?.stop(); };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  const BG_MUSIC_SRC = "/ambient-bg.mp3"; // ← Replace this path with your audio file
  //  ↑ ─────────────────────────────────────────────────────────────────────────
  //
  //  Progressive volume curve:
  //    Question  1  → volume 0.06  (barely audible — room tone)
  //    Question 13  → volume ~0.30 (warm, present)
  //    Question 25  → volume 0.72  (cinematic intensity)
  //  Uses ease-in² so the climb feels organic rather than linear.
  const calcBgVolume = (idx) => {
    const t = idx / (PUZZLES.length - 1); // normalise to 0..1
    const eased = t * t;                  // ease-in squared
    const MIN_VOL = 0.06;
    const MAX_VOL = 0.72;
    return MIN_VOL + eased * (MAX_VOL - MIN_VOL);
  };

  // ── Init the HTML5 <audio> element once on mount ──
  useEffect(() => {
    const el = new Audio(BG_MUSIC_SRC);
    el.loop = true;                    // loops continuously
    el.volume = calcBgVolume(0);       // start faint at Q1
    el.preload = "auto";
    bgMusicRef.current = el;
    return () => { el.pause(); el.src = ""; }; // cleanup on unmount
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Toggle bg music play/pause when bgMusicOn state changes ──
  useEffect(() => {
    const el = bgMusicRef.current;
    if (!el) return;
    if (bgMusicOn) {
      el.volume = calcBgVolume(currentIdx); // sync volume before play
      el.play().catch(() => {
        // Browser autoplay policy may block this until a user gesture; fail silently
      });
    } else {
      el.pause();
    }
  }, [bgMusicOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Smoothly ramp bg volume every time the question index advances ──
  useEffect(() => {
    const el = bgMusicRef.current;
    if (!el || !bgMusicOn) return;
    const targetVol = calcBgVolume(currentIdx);
    const startVol  = el.volume;
    const diff       = targetVol - startVol;
    const STEPS      = 30;                  // ~500 ms total at 60 fps
    let step         = 0;
    const timer = setInterval(() => {
      step++;
      el.volume = Math.min(1, Math.max(0, startVol + diff * (step / STEPS)));
      if (step >= STEPS) clearInterval(timer);
    }, 500 / STEPS);
    return () => clearInterval(timer);
  }, [currentIdx, bgMusicOn]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Stage transitions in audio ──
  const prevStageRef = useRef(1);
  useEffect(() => {
    if (!audioOn || !audioStarted) return;
    if (currentStage !== prevStageRef.current) {
      audioRef.current?.transitionStage(currentStage);
      prevStageRef.current = currentStage;
    }
  }, [currentStage, audioOn, audioStarted]);

  // ── Spotlight ──
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ── Stars (memoized) ──
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    d: `${2 + Math.random() * 5}s`,
    minO: (0.05 + Math.random() * 0.1).toFixed(2),
    maxO: (0.3 + Math.random() * 0.5).toFixed(2),
    delay: `${-Math.random() * 5}s`,
  })), []);

  // ── Handlers ──
  const toggleAudio = useCallback(() => {
    if (!audioOn) {
      setAudioOn(true);
      if (!audioStarted) {
        audioRef.current?.start(currentStage);
        prevStageRef.current = currentStage;
        setAudioStarted(true);
      } else {
        audioRef.current?.start(currentStage);
      }
    } else {
      setAudioOn(false);
      audioRef.current?.stop();
    }
  }, [audioOn, audioStarted, currentStage]);

  // ── Background music toggle handler ──
  // Wired to the ♪ / ♩ button in the controls bar (separate from SFX engine)
  const toggleBgMusic = useCallback(() => {
    setBgMusicOn(prev => !prev);
  }, []);

  const handleAnswer = useCallback((choiceIdx) => {
    if (answered) return;
    setSelected(choiceIdx);
    setAnswered(true);

    // MBTI scoring: each choice has [IE, NS, TF, JP] weights
    const w = puzzle.weights[choiceIdx];
    setAxes(prev => ({
      IE: prev.IE + w[0],
      NS: prev.NS + w[1],
      TF: prev.TF + w[2],
      JP: prev.JP + w[3],
    }));

    if (choiceIdx === puzzle.answer) {
      setPulse(true);
      setTimeout(() => setPulse(false), 1200);
      if (audioOn) audioRef.current?.playChime();
    } else {
      setShake(true);
      setGlitching(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setGlitching(false), 500);
      if (audioOn) audioRef.current?.playError();
    }
    setTimeout(() => setShowExplanation(true), 400);
  }, [answered, puzzle, audioOn]);

  const handleNext = useCallback(() => {
    if (currentIdx < PUZZLES.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setAnswered(false);
      setShowExplanation(false);
    } else {
      // Calculate MBTI
      const type = getMBTIType(axes);
      const group = getMBTIGroup(type);
      setMbtiResult(type);
      setMbtiGroup(group);
      if (audioOn) audioRef.current?.stop();
      // Fade out background music at the result screen
      if (bgMusicRef.current && bgMusicOn) {
        const el = bgMusicRef.current;
        const fadeOut = setInterval(() => {
          el.volume = Math.max(0, el.volume - 0.04);
          if (el.volume <= 0) { el.pause(); clearInterval(fadeOut); }
        }, 80);
      }
      setBgMusicOn(false);
      setPhase("result");
      setTimeout(() => setThemeTransitioned(true), 300);
    }
  }, [currentIdx, axes, audioOn]);

  const handleRestart = useCallback(() => {
    setPhase("intro");
    setCurrentIdx(0);
    setSelected(null);
    setAnswered(false);
    setAxes({ IE: 0, NS: 0, TF: 0, JP: 0 });
    setShowExplanation(false);
    setMbtiResult(null);
    setMbtiGroup(null);
    setThemeTransitioned(false);
    setAudioStarted(false);
    setAudioOn(false);
    audioRef.current?.stop();
    // Stop and rewind background music on restart
    setBgMusicOn(false);
    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.volume = calcBgVolume(0); // reset to Q1 volume
    }
  }, []);

  // ── Theme ──
  const accentColor = (phase === "result" && themeTransitioned && mbtiGroup)
    ? mbtiGroup.color : "#8b5cf6";
  const accentDim = (phase === "result" && themeTransitioned && mbtiGroup)
    ? mbtiGroup.colorDim : "rgba(139,92,246,0.15)";
  const accentGlow = (phase === "result" && themeTransitioned && mbtiGroup)
    ? mbtiGroup.colorGlow : "rgba(139,92,246,0.35)";
  const accentBorder = (phase === "result" && themeTransitioned && mbtiGroup)
    ? mbtiGroup.colorBorder : "rgba(139,92,246,0.3)";
  const meshGradient = (phase === "result" && themeTransitioned && mbtiGroup)
    ? mbtiGroup.gradientMesh
    : "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(88,28,235,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.12) 0%, transparent 60%)";

  // ── Archetype ──
  const archetype = mbtiResult ? MBTI_ARCHETYPES[mbtiResult] : null;

  // ── Stage label ──
  const stageLabels = {
    1: { en: "Baseline", ar: "الخط الأساسي" },
    2: { en: "The Deepening", ar: "التعمق" },
    3: { en: "The Climax", ar: "الذروة" },
  };

  // ═══════════════════════════════════════════════════════
  //  CSS
  // ═══════════════════════════════════════════════════════
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&family=Geist:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:#030712;}

    .app{
      min-height:100vh;
      background:${meshGradient}, radial-gradient(ellipse 50% 40% at 50% 50%, rgba(16,185,129,0.05) 0%, transparent 70%), #030712;
      font-family:'Geist','IBM Plex Sans Arabic',sans-serif;
      color:#f0f4ff;position:relative;overflow:hidden;
      transition:background 1.8s cubic-bezier(0.4,0,0.2,1);
    }
    .app.rtl{direction:rtl;font-family:'IBM Plex Sans Arabic','Geist',sans-serif;}

    .spotlight{
      position:fixed;pointer-events:none;z-index:0;
      width:600px;height:600px;border-radius:50%;
      background:radial-gradient(circle, ${accentGlow.replace("0.35","0.07")} 0%, transparent 70%);
      transform:translate(-50%,-50%);
      transition:left 0.12s ease,top 0.12s ease,background 1.8s ease;
    }

    /* ── Controls bar ── */
    .controls-bar{
      position:fixed;top:18px;right:20px;z-index:100;
      display:flex;align-items:center;gap:8px;
    }
    .app.rtl .controls-bar{right:auto;left:20px;flex-direction:row-reverse;}
    .ctrl-pill{
      display:flex;gap:4px;padding:5px;
      background:rgba(255,255,255,0.05);
      backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
      border:1px solid rgba(255,255,255,0.09);border-radius:14px;
    }
    .ctrl-btn{
      padding:7px 14px;border-radius:10px;border:none;
      font-size:12.5px;font-weight:500;cursor:pointer;
      transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
      font-family:inherit;
    }
    .ctrl-btn.active{
      background:${accentDim};color:${accentColor};
      border:1px solid ${accentBorder};
      box-shadow:0 0 16px ${accentGlow};
      transition:background 1.2s ease,color 1.2s ease,border-color 1.2s ease,box-shadow 1.2s ease;
    }
    .ctrl-btn:not(.active){background:transparent;color:rgba(255,255,255,0.38);}
    .ctrl-btn:active{transform:scale(0.94);}
    .icon-btn{
      width:34px;height:34px;border-radius:10px;border:none;cursor:pointer;
      background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);
      color:rgba(255,255,255,0.5);font-size:14px;display:flex;align-items:center;justify-content:center;
      transition:all 0.22s cubic-bezier(0.34,1.56,0.64,1);
    }
    .icon-btn:hover{background:rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);}
    .icon-btn.on{background:${accentDim};color:${accentColor};border-color:${accentBorder};}
    .icon-btn:active{transform:scale(0.92);}

    /* ── Glass ── */
    .glass{
      background:rgba(255,255,255,0.04);
      backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);
      border:1px solid rgba(255,255,255,0.09);border-radius:24px;
    }
    .glass-strong{
      background:rgba(255,255,255,0.065);
      backdrop-filter:blur(32px) saturate(200%);-webkit-backdrop-filter:blur(32px) saturate(200%);
      border:1px solid rgba(255,255,255,0.11);border-radius:28px;
    }

    /* ── Intro ── */
    .intro{
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      min-height:100vh;padding:40px 20px;text-align:center;position:relative;z-index:1;
    }
    .intro-badge{
      font-size:11.5px;font-weight:500;letter-spacing:0.16em;text-transform:uppercase;
      color:rgba(167,139,250,0.75);margin-bottom:24px;
    }
    .app.rtl .intro-badge{letter-spacing:0;}
    .intro h1{
      font-family:'DM Serif Display',serif;
      font-size:clamp(2.4rem,6vw,5rem);font-weight:400;line-height:1.05;
      background:linear-gradient(135deg,#c4b5fd 0%,#e0f2fe 50%,#6ee7b7 100%);
      -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
      margin-bottom:20px;max-width:700px;text-wrap:balance;
    }
    .app.rtl .intro h1{font-family:'IBM Plex Sans Arabic',serif;font-weight:700;line-height:1.3;}
    .intro-sub{
      font-size:clamp(0.95rem,2vw,1.15rem);color:rgba(224,242,254,0.5);
      max-width:500px;line-height:1.75;margin-bottom:16px;text-wrap:balance;
    }
    .intro-mbti-note{
      font-size:11.5px;color:rgba(167,139,250,0.5);margin-bottom:44px;
      font-style:italic;letter-spacing:0.02em;
    }
    .start-btn{
      padding:15px 48px;border-radius:100px;border:none;cursor:pointer;
      background:linear-gradient(135deg,rgba(139,92,246,0.55),rgba(6,182,212,0.38));
      color:#f0f4ff;font-size:1rem;font-weight:500;
      border:1px solid rgba(139,92,246,0.38);
      box-shadow:0 0 40px rgba(139,92,246,0.22),inset 0 1px 0 rgba(255,255,255,0.1);
      transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
      font-family:inherit;letter-spacing:0.02em;
    }
    .start-btn:hover{transform:scale(1.04);box-shadow:0 0 60px rgba(139,92,246,0.38),inset 0 1px 0 rgba(255,255,255,0.15);}
    .start-btn:active{transform:scale(0.96);}

    /* ── Game ── */
    .game{
      max-width:760px;margin:0 auto;padding:100px 20px 60px;
      position:relative;z-index:1;min-height:100vh;
    }
    .stage-meta{
      display:flex;justify-content:space-between;align-items:center;
      margin-bottom:8px;
    }
    .stage-badge{
      font-size:10.5px;font-weight:500;letter-spacing:0.12em;text-transform:uppercase;
      color:${accentColor};opacity:0.7;
      transition:color 1.2s ease;
    }
    .app.rtl .stage-badge{letter-spacing:0;}
    .q-counter{font-size:11.5px;color:rgba(255,255,255,0.28);font-weight:500;}
    .progress-track{
      height:1.5px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;margin-bottom:28px;
    }
    .progress-fill{
      height:100%;border-radius:2px;
      background:linear-gradient(90deg,${accentColor}cc,rgba(6,182,212,0.8));
      transition:width 0.5s cubic-bezier(0.4,0,0.2,1),background 1.5s ease;
    }
    .category-pill{
      display:inline-flex;align-items:center;gap:6px;
      padding:4px 13px;border-radius:100px;margin-bottom:18px;
      background:${accentDim};border:1px solid ${accentBorder};
      font-size:11px;font-weight:500;color:${accentColor};
      letter-spacing:0.07em;text-transform:uppercase;
      transition:background 1.2s ease,border-color 1.2s ease,color 1.2s ease;
    }
    .app.rtl .category-pill{letter-spacing:0;}
    .question-card{
      padding:34px 38px;margin-bottom:22px;
      position:relative;overflow:hidden;
    }
    .question-text{
      font-size:clamp(1rem,2.4vw,1.25rem);
      line-height:1.68;color:rgba(224,242,254,0.88);font-weight:400;
    }
    .app.rtl .question-text{line-height:1.85;}
    .shimmer{
      position:absolute;top:-50%;left:-50%;width:200%;height:200%;
      background:radial-gradient(ellipse 40% 30% at 70% 30%, ${accentDim} 0%, transparent 60%);
      pointer-events:none;transition:background 1.5s ease;
    }

    /* ── Choices ── */
    .choices{display:flex;flex-direction:column;gap:10px;margin-bottom:20px;}
    .choice-btn{
      padding:16px 22px;border-radius:16px;border:none;cursor:pointer;
      background:rgba(255,255,255,0.038);border:1px solid rgba(255,255,255,0.065);
      color:rgba(224,242,254,0.78);font-size:0.94rem;font-family:inherit;
      text-align:left;line-height:1.5;font-weight:400;
      transition:all 0.2s cubic-bezier(0.4,0,0.2,1);position:relative;overflow:hidden;
    }
    .app.rtl .choice-btn{text-align:right;}
    .choice-btn:hover:not(:disabled){
      background:rgba(255,255,255,0.075);border-color:${accentBorder};
      transform:translateY(-1px);box-shadow:0 6px 28px ${accentGlow.replace("0.35","0.09")};
    }
    .choice-btn:active:not(:disabled){transform:scale(0.97) translateY(0);}
    .choice-btn:disabled{cursor:default;}
    .choice-btn.correct{background:rgba(16,185,129,0.1);border-color:rgba(16,185,129,0.38);color:#6ee7b7;}
    .choice-btn.wrong{background:rgba(239,68,68,0.09);border-color:rgba(239,68,68,0.28);color:#fca5a5;}
    .choice-btn.neutral-dim{opacity:0.3;}

    /* ── Feedback animations ── */
    .pulse-ring{animation:bioluminPulse 1.2s ease-out forwards;}
    @keyframes bioluminPulse{
      0%{box-shadow:0 0 0 0 rgba(16,185,129,0.6);}
      50%{box-shadow:0 0 40px 12px rgba(16,185,129,0.22);}
      100%{box-shadow:0 0 0 0 rgba(16,185,129,0);}
    }
    .shake{animation:hapticShake 0.5s cubic-bezier(0.36,0.07,0.19,0.97);}
    @keyframes hapticShake{
      0%,100%{transform:translateX(0);}
      15%{transform:translateX(-8px);}30%{transform:translateX(7px);}
      45%{transform:translateX(-5px);}60%{transform:translateX(4px);}
      75%{transform:translateX(-2px);}
    }
    .glitch{animation:glitchAnim 0.45s steps(4) forwards;}
    @keyframes glitchAnim{
      0%{filter:none;}20%{filter:hue-rotate(90deg) saturate(2);}
      40%{filter:hue-rotate(-60deg) saturate(1.5);}
      60%{filter:hue-rotate(25deg);}80%{filter:hue-rotate(-15deg);}100%{filter:none;}
    }

    /* ── Explanation ── */
    .explanation{
      padding:22px 26px;border-radius:16px;margin-bottom:20px;
      background:${accentDim};border:1px solid ${accentBorder};
      font-size:0.88rem;line-height:1.72;color:rgba(199,210,254,0.82);
      animation:fadeSlide 0.38s ease forwards;
      transition:background 1.2s ease,border-color 1.2s ease;
    }
    .app.rtl .explanation{line-height:1.95;}
    @keyframes fadeSlide{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
    .insight-label{
      font-size:10.5px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;
      color:${accentColor};display:block;margin-bottom:9px;
      transition:color 1.2s ease;
    }
    .app.rtl .insight-label{letter-spacing:0;}
    .next-btn{
      width:100%;padding:15px;border-radius:16px;border:none;cursor:pointer;
      background:rgba(255,255,255,0.055);border:1px solid rgba(255,255,255,0.09);
      color:rgba(224,242,254,0.88);font-size:0.97rem;font-family:inherit;font-weight:500;
      transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .next-btn:hover{background:rgba(255,255,255,0.1);transform:scale(1.01);}
    .next-btn:active{transform:scale(0.97);}

    /* ── Result ── */
    .result{
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      min-height:100vh;padding:40px 20px;text-align:center;position:relative;z-index:1;
    }
    .mbti-type-badge{
      font-family:'JetBrains Mono','Geist',monospace;
      font-size:clamp(3rem,10vw,7rem);font-weight:500;letter-spacing:0.08em;
      color:${accentColor};
      text-shadow:0 0 60px ${accentGlow},0 0 120px ${accentGlow.replace("0.35","0.18")};
      margin-bottom:8px;line-height:1;
      transition:color 1.5s ease,text-shadow 1.5s ease;
      animation:typeReveal 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards;
    }
    @keyframes typeReveal{from{opacity:0;transform:scale(0.8);}to{opacity:1;transform:scale(1);}}
    .group-badge{
      font-size:12px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;
      color:rgba(255,255,255,0.35);margin-bottom:28px;
    }
    .app.rtl .group-badge{letter-spacing:0;}
    .archetype-icon-r{font-size:56px;margin-bottom:16px;animation:floatIcon 3s ease-in-out infinite;}
    @keyframes floatIcon{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    .archetype-title-r{
      font-family:'DM Serif Display',serif;
      font-size:clamp(1.8rem,4vw,3rem);font-weight:400;
      color:rgba(224,242,254,0.9);margin-bottom:24px;
    }
    .app.rtl .archetype-title-r{font-family:'IBM Plex Sans Arabic',serif;font-weight:700;}
    .archetype-desc-r{
      font-size:clamp(0.95rem,1.8vw,1.08rem);color:rgba(199,210,254,0.6);
      max-width:560px;line-height:1.82;margin-bottom:32px;text-wrap:balance;
    }
    .app.rtl .archetype-desc-r{line-height:2.1;}
    .axes-grid{
      display:grid;grid-template-columns:repeat(4,1fr);gap:10px;
      width:100%;max-width:560px;margin-bottom:36px;
    }
    .axis-card{
      padding:14px 10px;border-radius:16px;text-align:center;
      background:${accentDim};border:1px solid ${accentBorder};
      transition:background 1.2s ease,border-color 1.2s ease;
    }
    .axis-letter{font-size:1.5rem;font-weight:600;color:${accentColor};line-height:1;transition:color 1.2s ease;}
    .axis-label{font-size:10px;color:rgba(255,255,255,0.3);margin-top:4px;letter-spacing:0.05em;}
    .app.rtl .axis-label{letter-spacing:0;}
    .restart-btn{
      padding:13px 38px;border-radius:100px;border:1px solid rgba(255,255,255,0.1);
      background:rgba(255,255,255,0.045);color:rgba(224,242,254,0.65);
      cursor:pointer;font-family:inherit;font-size:0.92rem;font-weight:500;
      transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    }
    .restart-btn:hover{background:rgba(255,255,255,0.09);transform:scale(1.04);}
    .restart-btn:active{transform:scale(0.96);}

    /* ── Scratchpad ── */
    .scratchpad-overlay{
      position:fixed;inset:0;z-index:200;pointer-events:none;
    }
    .scratchpad-backdrop{
      position:absolute;inset:0;pointer-events:all;
      transition:opacity 0.35s ease;
    }
    .scratchpad-backdrop.open{opacity:1;}
    .scratchpad-backdrop.closed{opacity:0;pointer-events:none;}
    .scratchpad-panel{
      position:absolute;top:0;bottom:0;width:min(400px,92vw);
      background:rgba(10,10,18,0.88);
      backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);
      border:1px solid rgba(255,255,255,0.08);
      display:flex;flex-direction:column;pointer-events:all;
      transition:transform 0.4s cubic-bezier(0.34,1.2,0.64,1);
    }
    .app:not(.rtl) .scratchpad-panel{right:0;border-right:none;transform:translateX(100%);}
    .app:not(.rtl) .scratchpad-panel.open{transform:translateX(0);}
    .app.rtl .scratchpad-panel{left:0;border-left:none;transform:translateX(-100%);}
    .app.rtl .scratchpad-panel.open{transform:translateX(0);}
    .scratchpad-header{
      padding:20px 22px 16px;
      border-bottom:1px solid rgba(255,255,255,0.06);
      display:flex;align-items:center;justify-content:space-between;
    }
    .scratchpad-title{
      font-size:13.5px;font-weight:500;color:rgba(224,242,254,0.7);
      display:flex;align-items:center;gap:8px;
    }
    .scratchpad-dot{
      width:7px;height:7px;border-radius:50%;
      background:${accentColor};opacity:0.8;
      box-shadow:0 0 8px ${accentColor};
      transition:background 1.2s ease,box-shadow 1.2s ease;
    }
    .scratchpad-close{
      width:28px;height:28px;border-radius:8px;border:none;cursor:pointer;
      background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);
      font-size:14px;display:flex;align-items:center;justify-content:center;
      transition:all 0.2s ease;
    }
    .scratchpad-close:hover{background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.8);}
    .scratchpad-hint{
      padding:10px 22px;font-size:10.5px;color:rgba(255,255,255,0.22);
      font-style:italic;border-bottom:1px solid rgba(255,255,255,0.04);
      line-height:1.6;
    }
    .scratchpad-textarea{
      flex:1;padding:18px 22px;
      background:transparent;border:none;outline:none;resize:none;
      color:rgba(199,210,254,0.75);
      font-family:'JetBrains Mono','Courier New',monospace;
      font-size:13px;line-height:1.75;
      caret-color:${accentColor};
    }
    .scratchpad-textarea::placeholder{color:rgba(255,255,255,0.14);}
    .scratchpad-footer{
      padding:12px 22px;border-top:1px solid rgba(255,255,255,0.05);
      font-size:10px;color:rgba(255,255,255,0.18);
      display:flex;justify-content:space-between;
    }

    /* ── Stars ── */
    .star-field{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;}
    .star{
      position:absolute;width:1px;height:1px;background:#fff;border-radius:50%;
      animation:twinkle var(--d) ease-in-out infinite;
    }
    @keyframes twinkle{0%,100%{opacity:var(--minO);}50%{opacity:var(--maxO);}}

    /* ── Mobile ── */
    @media(max-width:480px){
      .question-card{padding:22px 18px;}
      .choice-btn{padding:13px 16px;font-size:0.88rem;}
      .game{padding:78px 12px 50px;}
      .axes-grid{grid-template-columns:repeat(2,1fr);}
    }
  `;

  const isScratchOpen = scratchpadOpen;

  return (
    <>
      <style>{css}</style>
      <div
        className={`app${isRTL ? " rtl" : ""}${shake ? " shake" : ""}${glitching ? " glitch" : ""}`}
        ref={containerRef}
      >
        {/* ── Stars ── */}
        <div className="star-field" aria-hidden="true">
          {stars.map(s => (
            <div key={s.id} className="star" style={{
              left: s.left, top: s.top, animationDelay: s.delay,
              "--d": s.d, "--minO": s.minO, "--maxO": s.maxO
            }} />
          ))}
        </div>

        {/* ── Spotlight ── */}
        <div
          className="spotlight"
          style={{ left: mousePos.x, top: mousePos.y }}
          aria-hidden="true"
        />

        {/* ── Controls ── */}
        <div className="controls-bar">
          {/* Language */}
          <div className="ctrl-pill" role="group" aria-label="Language">
            <button className={`ctrl-btn${lang === "en" ? " active" : ""}`} onClick={() => setLang("en")}>EN</button>
            <button className={`ctrl-btn${lang === "ar" ? " active" : ""}`} onClick={() => setLang("ar")}>عر</button>
          </div>
          {/* Background Music Toggle
              ♪ = music is ON (looping /ambient-bg.mp3)
              ♩ = music is OFF
              The SFX engine (chime / error) is unaffected by this button */}
          <button
            className={`icon-btn${bgMusicOn ? " on" : ""}`}
            onClick={toggleBgMusic}
            title={bgMusicOn ? "Mute background music" : "Play background music"}
            aria-label={bgMusicOn ? "Mute background music" : "Play background music"}
          >
            {bgMusicOn ? "♪" : "♩"}
          </button>
          {/* Scratchpad */}
          {phase === "game" && (
            <button
              className={`icon-btn${isScratchOpen ? " on" : ""}`}
              onClick={() => setScratchpadOpen(v => !v)}
              title="Open scratchpad"
              aria-label="Toggle scratchpad"
            >
              ✎
            </button>
          )}
        </div>

        {/* ═══════ INTRO ═══════ */}
        {phase === "intro" && (
          <div className="intro">
            <div className="intro-badge">{t({ en: "Logic · Linguistics · Psyche — 25 Puzzles", ar: "المنطق · اللغة · النفس — ٢٥ لغزاً" })}</div>
            <h1>{t({ en: "The Architecture of Thought", ar: "هندسة الفكر" })}</h1>
            <p className="intro-sub">
              {t({
                en: "Twenty-five puzzles at the collision of formal logic, paradox, ethics, consciousness, and language. Each answer secretly maps the architecture of your mind.",
                ar: "خمسة وعشرون لغزاً عند تقاطع المنطق الشكلي والمفارقة والأخلاق والوعي واللغة. كل إجابة ترسم سراً هندسة عقلك."
              })}
            </p>
            <p className="intro-mbti-note">
              {t({ en: "Your choices will reveal your 16 Personalities MBTI profile.", ar: "ستكشف خياراتك عن ملفك الشخصي وفق نموذج الشخصيات الستة عشر." })}
            </p>
            <button className="start-btn" onClick={() => setPhase("game")}>
              {t({ en: "Begin the Session", ar: "ابدأ الجلسة" })}
            </button>
          </div>
        )}

        {/* ═══════ GAME ═══════ */}
        {phase === "game" && puzzle && (
          <div className="game">
            {/* Progress */}
            <div className="stage-meta">
              <span className="stage-badge">{t(stageLabels[currentStage])}</span>
              <span className="q-counter">{currentIdx + 1} / {PUZZLES.length}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>

            {/* Category */}
            <div className="category-pill">{t(puzzle.category)}</div>

            {/* Question card */}
            <div className={`glass question-card${pulse ? " pulse-ring" : ""}`}>
              <div className="shimmer" aria-hidden="true" />
              <p className="question-text">{t(puzzle.question)}</p>
            </div>

            {/* Choices */}
            <div className="choices">
              {(isRTL ? puzzle.choices.ar : puzzle.choices.en).map((choice, idx) => {
                let cls = "choice-btn";
                if (answered) {
                  if (idx === puzzle.answer) cls += " correct";
                  else if (idx === selected && idx !== puzzle.answer) cls += " wrong";
                  else cls += " neutral-dim";
                }
                return (
                  <button key={idx} className={cls} onClick={() => handleAnswer(idx)} disabled={answered}>
                    {choice}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <>
                <div className="explanation">
                  <span className="insight-label">{t({ en: "Insight", ar: "البصيرة" })}</span>
                  {t(puzzle.explanation)}
                </div>
                <button className="next-btn" onClick={handleNext}>
                  {currentIdx < PUZZLES.length - 1
                    ? t({ en: "Next Puzzle →", ar: "→ اللغز التالي" })
                    : t({ en: "Reveal My Profile →", ar: "→ اكشف عن ملفي النفسي" })}
                </button>
              </>
            )}
          </div>
        )}

        {/* ═══════ RESULT ═══════ */}
        {phase === "result" && archetype && mbtiGroup && (
          <div className="result">
            {/* MBTI Type */}
            <div className="mbti-type-badge">{mbtiResult}</div>
            <div className="group-badge">
              {t(mbtiGroup.name)} · {t(mbtiGroup.groupDesc)}
            </div>

            {/* Archetype */}
            <div className="archetype-icon-r" role="img" aria-label={t(archetype.title)}>
              {archetype.icon}
            </div>
            <h2 className="archetype-title-r">{t(archetype.title)}</h2>

            {/* Description card */}
            <div className="glass-strong" style={{
              padding: "30px 36px", maxWidth: "580px", marginBottom: "32px",
              borderColor: mbtiGroup.colorBorder,
              transition: "border-color 1.5s ease",
            }}>
              <p className="archetype-desc-r" style={{ marginBottom: 0 }}>
                {t(archetype.description)}
              </p>
            </div>

            {/* Axes breakdown */}
            <div className="axes-grid">
              {[
                { letter: axes.IE >= 0 ? "I" : "E", label: { en: axes.IE >= 0 ? "Introverted" : "Extraverted", ar: axes.IE >= 0 ? "انطوائي" : "انبساطي" } },
                { letter: axes.NS >= 0 ? "N" : "S", label: { en: axes.NS >= 0 ? "Intuitive" : "Sensing", ar: axes.NS >= 0 ? "حدسي" : "حسي" } },
                { letter: axes.TF >= 0 ? "T" : "F", label: { en: axes.TF >= 0 ? "Thinking" : "Feeling", ar: axes.TF >= 0 ? "متفكر" : "عاطفي" } },
                { letter: axes.JP >= 0 ? "J" : "P", label: { en: axes.JP >= 0 ? "Judging" : "Perceiving", ar: axes.JP >= 0 ? "حاكم" : "مدرك" } },
              ].map((ax, i) => (
                <div key={i} className="axis-card">
                  <div className="axis-letter">{ax.letter}</div>
                  <div className="axis-label">{t(ax.label)}</div>
                </div>
              ))}
            </div>

            <button className="restart-btn" onClick={handleRestart}>
              {t({ en: "Begin Again", ar: "ابدأ من جديد" })}
            </button>
          </div>
        )}

        {/* ═══════ SCRATCHPAD ═══════ */}
        <div className="scratchpad-overlay" aria-hidden={!isScratchOpen}>
          {/* Backdrop */}
          <div
            className={`scratchpad-backdrop${isScratchOpen ? " open" : " closed"}`}
            style={{ background: "rgba(0,0,0,0.3)" }}
            onClick={() => setScratchpadOpen(false)}
          />
          {/* Panel */}
          <div className={`scratchpad-panel${isScratchOpen ? " open" : ""}`} role="dialog" aria-label="Scratchpad">
            <div className="scratchpad-header">
              <span className="scratchpad-title">
                <span className="scratchpad-dot" aria-hidden="true" />
                {t({ en: "Lab Notes", ar: "مذكرات المعمل" })}
              </span>
              <button className="scratchpad-close" onClick={() => setScratchpadOpen(false)} aria-label="Close scratchpad">✕</button>
            </div>
            <p className="scratchpad-hint">
              {t({
                en: "Isolate clauses, test premises, draft arguments. Your thoughts stay local.",
                ar: "عزل الجمل، اختبار المقدمات، صياغة الحجج. أفكارك تبقى هنا فقط."
              })}
            </p>
            <textarea
              className="scratchpad-textarea"
              value={scratchText}
              onChange={e => setScratchText(e.target.value)}
              placeholder={t({ en: "// Think here...\n// Copy any puzzle fragment and work it out.", ar: "// فكّر هنا...\n// انسخ أي جزء من اللغز واعمل على حله." })}
              spellCheck={false}
              dir={isRTL ? "rtl" : "ltr"}
            />
            <div className="scratchpad-footer">
              <span>{scratchText.length} {t({ en: "chars", ar: "حرف" })}</span>
              <button
                onClick={() => setScratchText("")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: "10px", fontFamily: "inherit" }}
              >
                {t({ en: "clear", ar: "مسح" })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
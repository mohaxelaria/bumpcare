// Education content for the BumpCare learning hub. Each article is a list
// of simple content blocks the article screen renders generically:
//   { type: 'paragraph', text }
//   { type: 'bullets', items: [string, ...] }
//   { type: 'callout', tone: 'warning' | 'urgent', text }
//   { type: 'glossary', items: [{ term, definition }] }

export const EDUCATION_ARTICLES = [
  {
    id: 'what-is-obstructed-labour',
    icon: '👶',
    title: 'What Is Obstructed Labour?',
    blocks: [
      {
        type: 'paragraph',
        text:
          'Obstructed labour happens when the baby cannot descend through the birth canal despite strong, regular contractions. It is a serious complication that needs timely medical attention.',
      },
      {
        type: 'paragraph',
        text:
          'Recognizing risk factors early is an important part of safe maternity care. Maternal health training materials (including WHO guidance) emphasize a few key things clinicians assess during pregnancy and labour:',
      },
      {
        type: 'bullets',
        items: [
          "The baby's presentation and position",
          "Descent of the baby's head into the pelvis",
          'Pelvic assessment',
          'Recognizing early signs of obstruction',
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text:
          'BumpCare is designed to support early identification of some of these risk factors — it does not replace clinical assessment during labour.',
      },
    ],
  },
  {
    id: 'risk-factors',
    icon: '🔎',
    title: 'Risk Factors BumpCare Screens For',
    blocks: [
      {
        type: 'paragraph',
        text:
          "BumpCare's ultrasound screening looks at a small set of factors linked to a higher chance of a difficult labour:",
      },
      {
        type: 'bullets',
        items: [
          'Abnormal fetal presentation (breech or transverse instead of head-down)',
          "Fetal position",
          'Fetal size / head measurements (BPD, HC)',
          'Poor or inconclusive ultrasound scan quality',
        ],
      },
      {
        type: 'callout',
        tone: 'warning',
        text: 'BumpCare identifies possible risk factors. It does not diagnose obstructed labour.',
      },
    ],
  },
  {
    id: 'understanding-results',
    icon: '📊',
    title: 'Understanding Your Screening Result',
    blocks: [
      {
        type: 'paragraph',
        text: 'What each screening result means:',
      },
      {
        type: 'bullets',
        items: [
          'No obvious risk factor identified — none of the screened factors stood out in this scan. Continue routine prenatal care.',
          'Review recommended — one or more factors may be worth a closer look from your healthcare provider. Not an emergency by itself, but professional assessment is recommended.',
          "Scan inconclusive — the scan quality wasn't sufficient for a reliable read. Try rescanning in better conditions, or seek an in-person ultrasound.",
        ],
      },
      {
        type: 'paragraph',
        text: 'Terms you may see on your results:',
      },
      {
        type: 'glossary',
        items: [
          { term: 'Cephalic', definition: 'Head-down position — the most common and generally favorable position for birth.' },
          { term: 'Breech', definition: "Baby's bottom or feet are positioned to deliver first." },
          { term: 'Transverse', definition: 'Baby is lying sideways across the uterus.' },
          { term: 'BPD', definition: 'Biparietal diameter — the width of the baby’s head, measured side to side.' },
          { term: 'HC', definition: "Head circumference — the distance around the baby's head." },
        ],
      },
    ],
  },
  {
    id: 'when-to-seek-care',
    icon: '⚠',
    title: 'When to Seek Medical Care',
    blocks: [
      {
        type: 'callout',
        tone: 'urgent',
        text:
          'Contact a healthcare professional or go to the nearest facility immediately if you experience any of the following — regardless of what BumpCare shows.',
      },
      {
        type: 'bullets',
        items: [
          'Heavy vaginal bleeding',
          'Severe or persistent headache',
          'Vision changes (blurring, spots, flashing lights)',
          'Fainting or severe dizziness',
          'Fever',
          'Severe abdominal pain',
          'Difficulty breathing',
          'Reduced or no fetal movement',
          'Any symptom that feels seriously wrong',
        ],
      },
      {
        type: 'callout',
        tone: 'urgent',
        text:
          'These signs are always more urgent than a BumpCare scan. BumpCare is a screening support tool — it does not replace emergency care.',
      },
    ],
  },
  {
    id: 'using-safely',
    icon: '📱',
    title: 'How to Use BumpCare Safely',
    blocks: [
      {
        type: 'bullets',
        items: [
          'Correctly position the belt around the abdomen per the fitting guide',
          'Confirm good probe contact before capturing a scan',
          'Remain still and avoid talking during scanning',
          'If scan quality is poor, reposition and rescan rather than relying on a low-quality result',
          'Never use a BumpCare result as a substitute for regular prenatal checkups',
          'Contact a healthcare professional promptly when the app recommends review',
        ],
      },
    ],
  },
];

export function getArticleById(id) {
  return EDUCATION_ARTICLES.find((a) => a.id === id) || null;
}

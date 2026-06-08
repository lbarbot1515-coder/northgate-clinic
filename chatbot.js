// ===================================================
// NORTHGATE WELLNESS & MEDICAL CENTER — AI CHATBOT
// Safe version — calls Vercel instead of OpenAI directly
// Your API key is hidden on Vercel's servers
// ===================================================

// This points to YOUR Vercel function — safe, no key exposed!
const VERCEL_API_URL = "/api/chat";

// ===== ALL CLINIC KNOWLEDGE (system prompt) =====
const SYSTEM_PROMPT = `
You are a friendly, professional AI assistant for Northgate Wellness & Medical Center (NWMC).
Your job is to help patients and visitors with questions about the clinic.
Always be warm, helpful, and concise. Use bullet points when listing multiple items.
If someone has a medical emergency, always tell them to call 911 or our emergency line (925) 774-9911.
Never give specific medical advice — always recommend they speak with a doctor.
If you don't know something, say so and offer to help them contact the clinic directly.

=== CLINIC OVERVIEW ===
Name: Northgate Wellness & Medical Center (NWMC)
Founded: 1989 by Dr. Margaret H. Caldwell and Dr. Elias M. Osei
Type: Full-service, multi-specialty outpatient clinic
Staff: 340+ employees, 62 licensed physicians, 28 nurse practitioners
Patients: 48,000+ registered patients annually
Affiliations: St. Mary's Regional Hospital, UCSF Health Network
NPI Number: 1487263059
Website: northgatewellness.org

=== LOCATIONS ===
1. MAIN CAMPUS — 4820 Northgate Blvd, Suite 100-800, Maplewood, CA 94523
   Phone: (925) 774-3000 | Hours: Mon-Thu 7AM-8PM, Fri 7AM-6PM, Sat 8AM-4PM, Sun 9AM-2PM

2. EASTSIDE CLINIC — 1150 Ridgewood Ave, Suite 210, Concord, CA 94520
   Phone: (925) 682-4400 | Hours: Mon-Thu 8AM-7PM, Fri 8AM-5PM, Sat 9AM-3PM

3. WEST VALLEY ANNEX — 305 Sunridge Pkwy, Suite 50, Walnut Creek, CA 94596
   Phone: (925) 933-6100 | Hours: Mon-Thu 8AM-6PM, Fri 8AM-5PM

4. TELEHEALTH — Phone: (925) 774-8800 | Hours: Mon-Fri 8AM-8PM

=== EMERGENCY ===
Emergency Line: (925) 774-9911 (24/7)
Nurse Hotline: (925) 774-6200
Urgent Care: Open 8AM-9PM daily

=== DOCTORS (sample) ===
Dr. James Whitfield — Family Medicine — Ext. 3100
Dr. Yuki Tanaka — Cardiology — Ext. 3130
Dr. Fatima Al-Rashid — OB-GYN — Ext. 3140
Dr. Patricia Howell — Pediatrics — Ext. 3120
Dr. Marcus DuBois — Psychiatry — Ext. 3170
Dr. Sarah Kim — Endocrinology — Ext. 3180
Dr. Helen Brandt — Neurology — Ext. 3200
Dr. Omar Hassan — Gastroenterology — Ext. 3190
Dr. Thomas Kellner — Orthopedics — Ext. 3150
Dr. Anjali Patel — Dermatology — Ext. 3160

=== INSURANCE ===
Accepts: Blue Shield, Anthem, Cigna, Aetna, UnitedHealthcare, Health Net, Medicare, Medi-Cal, TRICARE, VA Community Care, Covered California, and most major HMO/PPO plans.

=== SELF-PAY RATES ===
New Patient Visit: $185 | Telehealth: $110 | Urgent Care: $160 | Annual Wellness: $220
Financial assistance / sliding scale available. Call billing: (925) 774-3050

=== APPOINTMENTS ===
Call (925) 774-3000 | Online: portal.northgatewellness.org | Same-day: call at 7AM
Cancel 24hrs in advance. $45 no-show fee for specialists.

=== SERVICES ===
20 specialties including: Family Medicine, Cardiology, Pediatrics, OB-GYN, Orthopedics,
Neurology, Psychiatry, Dermatology, Endocrinology, Gastroenterology, Pulmonology,
Rheumatology, Ophthalmology, Physical Therapy, Urgent Care, Telehealth, Lab, Imaging, Pharmacy, Infusion Center.
`;

// ===== CONVERSATION HISTORY =====
let conversationHistory = [];

// ===== SEND MESSAGE TO VERCEL =====
async function sendMessage(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory
  ];

  const response = await fetch(VERCEL_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Server error");
  }

  const data = await response.json();
  conversationHistory.push({ role: "assistant", content: data.reply });
  return data.reply;
}

// ===== FORMAT REPLY =====
function formatReply(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ===== ADD MESSAGE =====
function addMessage(text, sender = 'bot', isHTML = false) {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${sender}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (isHTML) bubble.innerHTML = text;
  else bubble.textContent = text;
  const time = document.createElement('div');
  time.className = 'msg-time';
  time.textContent = getTime();
  div.appendChild(bubble);
  div.appendChild(time);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// ===== TYPING INDICATOR =====
function showTyping() {
  const messages = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg bot';
  div.id = 'typingIndicator';
  div.innerHTML = `<div class="msg-bubble typing-bubble"><span></span><span></span><span></span></div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}

// ===== HANDLE SEND =====
async function handleSend() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const suggestions = document.getElementById('chatSuggestions');
  if (suggestions) suggestions.style.display = 'none';

  input.value = '';
  addMessage(msg, 'user');
  showTyping();

  const sendBtn = document.getElementById('chatSendBtn');
  sendBtn.disabled = true;
  input.disabled = true;

  try {
    const reply = await sendMessage(msg);
    hideTyping();
    addMessage(formatReply(reply), 'bot', true);
  } catch (error) {
    hideTyping();
    let errorMsg = "Sorry, I'm having trouble connecting. Please call us at (925) 774-3000.";
    if (error.message.includes("API key not configured")) {
      errorMsg = "⚠️ The API key hasn't been added to Vercel yet. Please add OPENAI_API_KEY in your Vercel environment variables.";
    }
    addMessage(errorMsg, 'bot');
  }

  sendBtn.disabled = false;
  input.disabled = false;
  input.focus();
}

// ===== TOGGLE CHAT =====
function toggleChat() {
  const win = document.getElementById('chat-window');
  const bubble = document.getElementById('chat-bubble');
  const openIcon = bubble.querySelector('.open-icon');
  const closeIcon = bubble.querySelector('.close-icon');
  const dot = bubble.querySelector('.chat-notification-dot');
  const isOpen = !win.classList.contains('chat-hidden');

  if (isOpen) {
    win.classList.add('chat-hidden');
    openIcon.style.display = '';
    closeIcon.style.display = 'none';
  } else {
    win.classList.remove('chat-hidden');
    openIcon.style.display = 'none';
    closeIcon.style.display = '';
    dot.style.display = 'none';
    document.getElementById('chatInput').focus();
  }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('chat-bubble').addEventListener('click', toggleChat);
  document.getElementById('chatCloseBtn').addEventListener('click', toggleChat);
  document.getElementById('chatSendBtn').addEventListener('click', handleSend);
  document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('chatInput').value = chip.dataset.msg;
      handleSend();
    });
  });
  setTimeout(() => {
    const win = document.getElementById('chat-window');
    if (win.classList.contains('chat-hidden')) {
      document.querySelector('.chat-notification-dot').style.display = 'block';
    }
  }, 4000);
});

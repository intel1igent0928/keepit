const { useState, useEffect, useRef } = React;
const tg = window.Telegram?.WebApp;
const haptic = (t='light') => tg?.HapticFeedback?.impactOccurred?.(t);
const notify  = (t='success') => tg?.HapticFeedback?.notificationOccurred?.(t);
const save = (k,v) => { 
  const str = JSON.stringify(v);
  localStorage.setItem('k2_'+k, str); 
  try { if(tg?.CloudStorage) tg.CloudStorage.setItem('k2_'+k, str); } catch(e){}
};
const load = (k,d) => { try { const r=localStorage.getItem('k2_'+k); return r?JSON.parse(r):d; } catch{return d;} };

const CURRENCIES = ['UZS','KGS','USD','EUR','RUB','KZT'];
const ICONS = ['🍔','🚕','💪','🏠','💊','📚','🎮','✈️','👔','🎁','🛒','⚡','🌐','🎵','🎓','🏦'];
const LANGS = { ru:'Русский', en:'English' };
const daysInMonth = (y,m) => new Date(y,m+1,0).getDate();
const todayDate = () => new Date();
const monthKey = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`; };
const fmt = (n, cur='UZS', lang='ru') => { if(!n && n!==0) return '—'; return new Intl.NumberFormat(lang==='en'?'en-US':'ru-RU').format(Math.round(n))+' '+cur; };
const fmtShort = (n, cur='', lang='ru') => {
  let val = n;
  let suffix = '';
  if(n>=1000000) { val = n/1000000; suffix = 'M'; }
  else if(n>=1000) { val = n/1000; suffix = 'K'; }
  const f = new Intl.NumberFormat(lang==='en'?'en-US':'ru-RU', {maximumFractionDigits:val>=1000?0:1}).format(val);
  return f + suffix + (cur ? ' '+cur : '');
};
const fmtDate = (iso, lang='ru') => { const d=new Date(iso); return d.toLocaleDateString(lang==='en'?'en-US':'ru-RU',{day:'2-digit',month:'2-digit',year:'2-digit'}); };
const countWorkdays=(y,m,from,to)=>{let c=0;for(let d=from;d<=to;d++){const w=new Date(y,m,d).getDay();if(w!==0&&w!==6)c++;}return c;};
const workdaysInMonth=(y,m)=>countWorkdays(y,m,1,new Date(y,m+1,0).getDate());

const T = {
  ru:{ home:'Главная', budget:'Бюджет', savings:'Копилка', events:'События', settings:'Настройки',
       salary:'Зарплата', payday:'День выплаты', autoExpenses:'Авто-расходы', subscriptions:'Подписки',
       available:'Доступно', leftForMonthLabel:'Остаток на месяц', spent:'Потрачено', saved:'Накоплено', contracts:'Контракты',
       plannedUntilEnd:'Планируемые траты до конца месяца', initialSavings:'Начальный баланс', allDays:'Все дни',
       startFrom:'Начать списывать:', now:'С этого месяца', nextSalary:'Со следующей зарплаты', nextMonth:'Со следующего месяца',
       addCategory:'+ Добавить категорию', addSubscription:'+ Добавить подписку',
       addContract:'+ Добавить контракт', addGoal:'+ Добавить цель', addEvent:'+ Добавить событие',
       addBigExpense:'+ Добавить крупный расход', deposit:'Пополнить', withdraw:'Потратить',
       cancel:'Отмена', save:'Сохранить', reset:'Сбросить данные', confirm:'Подтвердить',
       received:'Получили зарплату?', today:'Сегодня', done:'Готово ✓', theme:'Тема',
       language:'Язык', currency:'Валюта', dark:'Тёмная', light:'Светлая',
       salaryDay:'День зарплаты', goalName:'Название цели', targetAmount:'Целевая сумма',
       monthlyDeposit:'Откладывать в месяц', fromSavings:'Из накоплений 🏦',
       bigExpenseTitle:'Название расхода', history:'История', noHistory:'Пока нет операций',
       nearestEvents:'Ближайшие события', noEvents:'Нет ближайших событий', eventName:'Имя или название', eventBudget:'Бюджет на подарок (необяз.)',
       debts:'Долги', iOwe:'Я должен', owedToMe:'Мне должны', addDebt:'+ Добавить долг',
       debtName:'Имя (Алишер, Ваня…)', debtAmount:'Сумма', debtNote:'Примечание (необяз.)',
       paidPart:'Частями', paidAll:'✓ Все', income:'Поступления', expenses:'Расходы', all:'Все', downloadCSV:'📥 Скачать CSV',
       yesterday:'Вчера', goals:'Цели', feedback:'💡 Идеи и Жалобы', feedbackPlaceholder:'Напишите вашу идею, жалобу или предложение...',
       feedbackSubmit:'📤 Отправить', tgNotifications:'🤖 Telegram уведомления', tgDesc1:'Уведомления через бота',
       tgDesc2:'Настроено автоматически. Уведомления приходят когда:', tgTest:'🔔 Отправить тест',
       tgDesc3:'• Получена зарплата\n• Добавлен долг\n• Записан крупный расход\n• Напоминание о подписке',
       helloTitle:'Привет! Я KeepIt', helloSub:'Умный финансовый помощник. Как ты получаешь деньги?',
       workerBtn:'💼 Я работаю — есть зарплата', studentBtn:'🎓 Я студент / получаю от родителей',
       yourSalary:'Твоя зарплата', yourSalarySub:'Сколько получаешь и в какой день месяца?',
       salaryDayPlace:'День выплаты (напр. 25)', dailyBudget:'Дневной бюджет', dailyBudgetSub:'Ты работаешь 5 дней в неделю. Сколько в день на обед + транспорт?',
       saveAuto:'Авто-накопление', saveAutoSub:'Остаток от зарплаты вычесть в копилку автоматически при получании?',
       saveTarget:'Цель накопления', saveTargetSub:'Если уже есть сбережения — введи сумму. (Можно 0)',
       pocketMoney:'Карманные деньги', pocketMoneySub:'Сколько сейчас есть на руках и на сколько дней они рассчитаны?',
       pocketDays:'На сколько дней? (например: 7)', pocketAddLater:'Когда дадут ещё — добавишь в приложении ✓',
       studentDailySub:'Сколько в день на обед и дорогу?',
       continue:'Продолжить →', letsGo:'Поехали! 🚀', skip:'Пропустить', back:'← Назад',
       salaryConfirmed:'✅ Да, поступила!', salaryNotYet:'⏰ Ещё нет', salaryOfDate:'Зарплата',
       youCanSpend:'Сегодня можно потратить', daysLeftOf:'дн. из', daysUntilSalary:'дн. до зарплаты',
       vsLastMonth:'Сравнение с прошлым месяцем', largeExpenses:'Крупные расходы', noLargeExpenses:'Нет крупных трат в этом месяце',
       extraIncomeBtn:'➕ Доп. доход', studentExtraBtn:'➕ Родители дали деньги / Доп. доход',
       mo:'мес', extra:'доп.', daysLeft:'дн. осталось', spentLower:'потрачено',
       salaryConfirmedLog:'Зарплата получена', autoSavingsLog:'Авто-накопления с зарплаты',
       largeExpenseDefault:'Крупный расход', extraIncomeDefault:'Доп. доход',
       perDay:'/ день', perMonth:'в месяц', workDays:'раб. дня', dailyBudgetHint:'💡 Это включает еду и транспорт вместе',
       immediately:'Сразу', partMonth:'По частям', immediatelyMonth:'Сразу за месяц', limitMonth:'Лимит в месяц',
       billingDay:'День списания (1-31)', total:'Итого:', due:'До', paid:'Оплачено', unpaid:'Не оплачено',
       delete:'Удалить', contractTitlePlace:'Контракт универа…', contractTotalPlace:'Общая сумма',
       contractInstallments:'Взносы (% + срок оплаты)', addInstallment:'+ Добавить взнос',
       savingsHistoryDeposit:'Пополнение', savingsHistoryWithdraw:'Расход',
       goalNamePlace:'iPhone 16, Машина…', optional:'(необяз.)', saveGoalBtn:'Отложить',
       howMuchToSave:'Сколько отложить?', inDays:'Через {n} дн.', ago:'{n} дн. назад',
       tomorrow:'Завтра', days:'дн.', resetConfirm:'Сбросить все данные?', feedbackSuccess:'Спасибо за ваш отзыв! Мы обязательно его рассмотрим.',
       loading:'Загрузка...', morning:'Доброе утро', afternoon:'Добрый день', evening:'Добрый вечер',
       debtOweLog:'Долг: ', debtLentLog:'Дал в долг: ', debtClosedLog:'Долг закрыт: ',
       debtReturnedLog:'вернули', debtReceivedLog:'получили', debtPaidAlready:'Уже выплачено:', debtReturnedAlready:'Уже вернули:',
       partially:'Частично', closed:'Закрытые', historyOp:'Операция', salaryLog:'Зарплата',
       autoExpenseAccum:'Авто-расход (накоплено)', subscription:'Подписки', fromSavings:'Из накоплений',
       savings:'Накопления', oweMe:'Мне должны', oweTo:'Я должен', extraIncome:'Доп. доход',
       savingsBalance:'Сумма накоплений', autoSavingsMo:'Авто-накопления / мес', paydaySett:'День зарплаты (1-31)',
       auto:'Авто'
     },
  en:{ home:'Home', budget:'Budget', savings:'Savings', events:'Events', settings:'Settings',
       salary:'Salary', payday:'Pay Day', autoExpenses:'Auto Expenses', subscriptions:'Subscriptions',
       available:'Available', leftForMonthLabel:'Left for month', spent:'Spent', saved:'Saved', contracts:'Contracts',
       plannedUntilEnd:'Planned expenses until end of month', initialSavings:'Initial balance', allDays:'All days',
       startFrom:'Start deducting:', now:'From this month', nextSalary:'From next salary', nextMonth:'From next month',
       addCategory:'+ Add Category', addSubscription:'+ Add Subscription',
       addContract:'+ Add Contract', addGoal:'+ Add Goal', addEvent:'+ Add Event',
       addBigExpense:'+ Add Large Expense', deposit:'Deposit', withdraw:'Withdraw',
       cancel:'Cancel', save:'Save', reset:'Reset Data', confirm:'Confirm',
       received:'Did you get paid?', today:'Today', done:'Done ✓', theme:'Theme',
       language:'Language', currency:'Currency', dark:'Dark', light:'Light',
       salaryDay:'Pay Day', goalName:'Goal Name', targetAmount:'Target Amount',
       monthlyDeposit:'Monthly Deposit', fromSavings:'From Savings 🏦',
       bigExpenseTitle:'Expense Title', history:'History', noHistory:'No transactions yet',
       nearestEvents:'Upcoming Events', noEvents:'No upcoming events', eventName:'Name or title', eventBudget:'Gift budget (optional)',
       debts:'Debts', iOwe:'I owe', owedToMe:'Owed to me', addDebt:'+ Add Debt',
       debtName:'Name (John, Alex…)', debtAmount:'Amount', debtNote:'Note (optional)',
       paidPart:'Partial', paidAll:'✓ All', income:'Income', expenses:'Expenses', all:'All', downloadCSV:'📥 Download CSV',
       yesterday:'Yesterday', goals:'Goals', feedback:'💡 Ideas & Feedback', feedbackPlaceholder:'Write your idea, complaint, or suggestion...',
       feedbackSubmit:'📤 Submit', tgNotifications:'🤖 Telegram Notifications', tgDesc1:'Bot notifications',
       tgDesc2:'Configured automatically. Notifications are sent when you:', tgTest:'🔔 Send test',
       tgDesc3:'• Salary received\n• Debt added\n• Large expense recorded\n• Subscription reminder',
       helloTitle:'Hi! I am KeepIt', helloSub:'Smart financial assistant. How do you earn money?',
       workerBtn:'💼 I work — I get a salary', studentBtn:'🎓 I am a student / I get allowance',
       yourSalary:'Your Salary', yourSalarySub:'How much do you get and what day of the month?',
       salaryDayPlace:'Pay day (e.g., 25)', dailyBudget:'Daily Budget', dailyBudgetSub:'You work 5 days a week. How much per day for lunch + transport?',
       saveAuto:'Auto-savings', saveAutoSub:'Automatically deduct the remainder of your salary to savings when received?',
       saveTarget:'Savings Goal', saveTargetSub:'If you already have savings — enter the amount. (Can be 0)',
       pocketMoney:'Pocket Money', pocketMoneySub:'How much do you have on hand and how many days is it for?',
       pocketDays:'For how many days? (e.g. 7)', pocketAddLater:'You can add more later in the app ✓',
       studentDailySub:'How much per day for lunch and transport?',
       continue:'Continue →', letsGo:'Let\'s go! 🚀', skip:'Skip', back:'← Back',
       salaryConfirmed:'✅ Yes, received!', salaryNotYet:'⏰ Not yet', salaryOfDate:'Salary',
       youCanSpend:'You can spend today', daysLeftOf:'days left of', daysUntilSalary:'days until salary',
       vsLastMonth:'vs last month', largeExpenses:'Large Expenses', noLargeExpenses:'No large expenses this month',
       extraIncomeBtn:'➕ Extra Income', studentExtraBtn:'➕ Parents gave money / Extra income',
       mo:'mo', extra:'extra', daysLeft:'days left', spentLower:'spent',
       salaryConfirmedLog:'Salary received', autoSavingsLog:'Auto-savings from salary',
       largeExpenseDefault:'Large Expense', extraIncomeDefault:'Extra Income',
       perDay:'/ day', perMonth:'per month', workDays:'work days', dailyBudgetHint:'💡 This includes food and transport together',
       immediately:'Immediately', partMonth:'In parts', immediatelyMonth:'Entire month', limitMonth:'Monthly limit',
       billingDay:'Billing day (1-31)', total:'Total:', due:'Due', paid:'Paid', unpaid:'Unpaid',
       delete:'Delete', contractTitlePlace:'University contract...', contractTotalPlace:'Total amount',
       contractInstallments:'Installments (% + due date)', addInstallment:'+ Add installment',
       savingsHistoryDeposit:'Deposit', savingsHistoryWithdraw:'Withdrawal',
       goalNamePlace:'iPhone 16, Car...', optional:'(optional)', saveGoalBtn:'Save',
       howMuchToSave:'How much to save?', inDays:'In {n} days', ago:'{n} days ago',
       tomorrow:'Tomorrow', days:'days', resetConfirm:'Reset all data?', feedbackSuccess:'Thank you for your feedback! We will definitely consider it.',
       loading:'Loading...', morning:'Good morning', afternoon:'Good afternoon', evening:'Good evening',
       debtOweLog:'Debt: ', debtLentLog:'Lent: ', debtClosedLog:'Debt closed: ',
       debtReturnedLog:'returned', debtReceivedLog:'received', debtPaidAlready:'Paid:', debtReturnedAlready:'Returned:',
       partially:'Partially', closed:'Closed', historyOp:'Operation', salaryLog:'Salary',
       autoExpenseAccum:'Auto-expense (accumulated)', subscription:'Subscriptions', fromSavings:'From savings',
       savings:'Savings', oweMe:'Owed to me', oweTo:'I owe', extraIncome:'Extra Income',
       savingsBalance:'Savings Balance', autoSavingsMo:'Auto-savings / month', paydaySett:'Pay Day',
       auto:'Auto'
  },
};

const DEFAULT_DATA = {
  salary:4000000, currency:'UZS', salaryDay:25,
  salaryConfirmedMonth:null, salaryLastAsked:null,
  salaryConfirmedAt:null, lastMonthResult:0,
  monthlySavings:2000000, // auto-deducted to savings when salary confirmed
  theme:'light', lang:'ru',
  botWebhookUrl:'', // Telegram bot webhook for notifications
  userType:'worker',
  pocketMoney:0,
  incomeEntries:[],
  categories:[],
  fixedExpenses:[], bigExpenses:[], contracts:[],
  debts:[],
  savingsBalance:0, savingsGoals:[], savingsHistory:[],
  activityLog:[],
  events:[], lastMonthSpent:0,
};
// Backend URL — change to your deployed server address
// During development: 'http://localhost:8000'
// In production: 'https://your-server.com'
const BACKEND_URL = 'http://localhost:8000';

const sendBotMsg=(text,endpoint='/notify')=>{
  const tgUserId=window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if(!tgUserId||!BACKEND_URL) return; // no user id or backend not set
  fetch(BACKEND_URL+endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({tg_user_id:tgUserId,text}),
  }).catch(()=>{}); // silent fail — notifications are non-critical
};

// Specialized notifiers
const notifySalary=(salary,monthlySavings,currency,lang='ru')=>{
  const t=T[lang];
  sendBotMsg(`💰 <b>${t.salaryConfirmedLog}!</b>\n\n${t.received}: <code>${fmt(salary,currency,lang)}</code>${monthlySavings>0?`\n${t.saveAuto}: <code>${fmt(monthlySavings,currency,lang)}</code> → ${t.savings} 🏦`:''}\n\n${lang==='en'?'Open KeepIt to see updated balance.':'Откройте KeepIt чтобы увидеть обновлённый баланс.'}`);
};
const notifySalaryPending=(lang='ru')=>sendBotMsg(
  lang==='en'?'⏰ <b>Salary not received yet</b>\n\nWe will remind you tomorrow. Don\'t forget to confirm in KeepIt when it arrives! 💸':'⏰ <b>Зарплата ещё не поступила</b>\n\nНапомним завтра. Не забудьте подтвердить в KeepIt когда придёт! 💸'
);
const notifyDebt=(name,amount,type,currency,lang='ru')=>{
  const t=T[lang];
  sendBotMsg(`${type==='owe'?'💸':'🤝'} <b>${type==='owe'?t.debtOweLog:t.debtLentLog}${name}</b>\n\n${t.debtAmount}: <code>${fmt(amount,currency,lang)}</code>\n\n${lang==='en'?'Open KeepIt → Debts.':'Откройте KeepIt → Долги.'}`);
};
const notifyDebtPaid=(name,amount,currency,lang='ru')=>{
  const t=T[lang];
  sendBotMsg(`✅ <b>${t.debtClosedLog}${name}!</b>\n\n<b>${name}</b> — <code>${fmt(amount,currency,lang)}</code>\n\n${lang==='en'?'Great job! 🎉':'Отличная работа! 🎉'}`);
};
const notifyBigExpense=(name,amount,currency,lang='ru')=>{
  const t=T[lang];
  sendBotMsg(`📤 <b>${t.largeExpenseDefault}</b>\n\n<b>${name}</b>: <code>${fmt(amount,currency,lang)}</code>\n\n${lang==='en'?'Recorded in KeepIt.':'Зафиксировано в KeepIt.'}`);
};

function calcBalance(data) {
  const now=todayDate();
  const lang=data.lang||'ru';
  const y=now.getFullYear(), m=now.getMonth(), d=now.getDate();
  const total=daysInMonth(y,m);
  const mKey = `${y}-${String(m).padStart(2,'0')}`;
  const fe=data.fixedExpenses||[], cats=(data.categories||[]).filter(c=>!c.startMonth||c.startMonth<=mKey), be=data.bigExpenses||[];
  const ie=data.incomeEntries||[];
  const fixedPaid=fe.filter(x=>x.day<=d).reduce((s,x)=>s+x.amount,0);
  const fixedMonthly=fe.reduce((s,x)=>s+x.amount,0);
  const wdElapsed=countWorkdays(y,m,1,d);
  const wdTotal=workdaysInMonth(y,m);
  const catSpent=cats.reduce((s,c)=>{
    if(c.deductType==='upfront') return s+(c.monthlyLimit||((c.dailyAmount||0)*wdTotal));
    if(c.type==='workday') return s+((c.dailyAmount||0)*wdElapsed);
    return s+((c.monthlyLimit||0)/total)*d;
  },0);
  const catMonthly=cats.reduce((s,c)=>{
    if(c.type==='workday') return s+(c.dailyAmount||0)*wdTotal;
    return s+(c.monthlyLimit||0);
  },0);
  const bigSpent=be.filter(x=>{
    const bd=new Date(x.date);
    const isCurrent = data.salaryConfirmedAt ? bd >= new Date(data.salaryConfirmedAt) : (bd.getMonth()===m&&bd.getFullYear()===y);
    return isCurrent && !x.fromSavings;
  }).reduce((s,x)=>s+x.amount,0);
  const extraIncome=ie.filter(x=>{
    const id=new Date(x.date);
    const isCurrent = data.salaryConfirmedAt ? id >= new Date(data.salaryConfirmedAt) : (id.getMonth()===m&&id.getFullYear()===y);
    return isCurrent;
  }).reduce((s,x)=>s+x.amount,0);
  const baseSalary=data.userType==='student'?(data.pocketMoney||0):data.salary;
  const totalIncome=baseSalary+extraIncome;
  const monthlySav=data.monthlySavings||0;
  const totalSpent=fixedPaid+catSpent+bigSpent;
  // Balance: income - expenses - reserved savings
  const balance=totalIncome-totalSpent-monthlySav;
  const grossBalance=totalIncome-totalSpent;
  const daysLeft=Math.max(1,total-d);
  let adjustedDaysLeft = daysLeft;
  let totalPeriod = total;
  if (data.userType === 'worker' && data.salaryDay) {
    let nextSal = new Date(y, m, data.salaryDay);
    if (d >= data.salaryDay) nextSal = new Date(y, m + 1, data.salaryDay);
    const diff = Math.ceil((nextSal - now) / (1000*60*60*24));
    if (diff > 0) adjustedDaysLeft = diff;
  } else if (data.userType === 'student' && data.pocketDays && data.pocketStartDate) {
    const start = new Date(data.pocketStartDate);
    const diff = Math.floor((now - start) / 86400000);
    const left = data.pocketDays - diff;
    adjustedDaysLeft = Math.max(1, left);
    totalPeriod = data.pocketDays;
  }
  const dailyBudget=Math.max(0,balance/adjustedDaysLeft);
  const wdLeft=Math.max(1,countWorkdays(y,m,d+1,total)+1);
  const workdayBudget=cats.find(c=>c.type==='workday')?.dailyAmount||0;
  const remainingCats = Math.max(0, catMonthly - catSpent);
  const remainingFixed = Math.max(0, fixedMonthly - fixedPaid);
  const leftForMonth = Math.max(0, balance - remainingCats - remainingFixed);
  return {totalSpent,balance,grossBalance,daysLeft:adjustedDaysLeft,totalPeriod,dailyBudget,catSpent,bigSpent,fixedPaid,total,elapsed:d,catMonthly,fixedMonthly,extraIncome,totalIncome,baseSalary,wdElapsed,wdTotal,wdLeft,workdayBudget,monthlySav,leftForMonth,remainingCats,remainingFixed};
}
const logActivity=(data,entry)=>({...data,activityLog:[...(data.activityLog||[]),{...entry,id:entry.id||Date.now(),date:entry.date||new Date().toISOString()}]});

function FlyChip({text,onDone}){ return <div className="fly-chip" onAnimationEnd={onDone}>{text}</div>; }

function FormattedInput({value, onChange, placeholder, style, className, lang='ru'}) {
  const valStr = (value===0||value) ? new Intl.NumberFormat(lang==='en'?'en-US':'ru-RU').format(value) : '';
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\s/g, '').replace(/,/g, '');
    if(raw==='') { onChange(''); return; }
    const num = parseFloat(raw);
    if(!isNaN(num)) onChange(num);
  };
  return <input type="text" inputMode="numeric" placeholder={placeholder} value={valStr} onChange={handleChange} style={style} className={className||"glass-input"}/>;
}

function NumPadSheet({title,currency,onClose,onConfirm,showSavings,showName,lang}){
  const t=T[lang||'ru'];
  const [val,setVal]=useState('0');
  const [name,setName]=useState('');
  const [fromSav,setFromSav]=useState(false);
  const press=k=>{ haptic('light'); setVal(p=>{ if(k==='⌫') return p.length>1?p.slice(0,-1):'0'; if(k==='.'&&p.includes('.')) return p; if(p==='0'&&k!=='.') return k; return p+k; }); };
  const confirm=()=>{ const n=parseFloat(val); if(!n) return; notify('success'); onConfirm(n,{fromSavings:fromSav,name:name||''}); };
  return(<>
    <div className="sheet-backdrop fade-in" onClick={onClose}/>
    <div className="bottom-sheet slide-up">
      <div className="sheet-handle"/>
      <div className="sheet-title">{title}</div>
      {showName && <input className="glass-input" placeholder={t.bigExpenseTitle} value={name} onChange={e=>setName(e.target.value)} style={{marginBottom:12}}/>}
      <div className="amount-display">{(+val||0).toLocaleString(lang==='en'?'en-US':'ru-RU')}<span style={{fontSize:18,color:'var(--text2)',marginLeft:6}}>{currency}</span></div>
      {showSavings && <div className="toggle-row"><label>{t.fromSavings}</label><label className="toggle"><input type="checkbox" checked={fromSav} onChange={e=>setFromSav(e.target.checked)}/><span className="toggle-slider"/></label></div>}
      <div className="numpad">{['1','2','3','4','5','6','7','8','9','.','0','⌫'].map(k=><button key={k} className={`num-key${k==='⌫'?' del':''}`} onClick={()=>press(k)}>{k}</button>)}</div>
      <button className="num-key ok" style={{width:'100%',borderRadius:16,fontSize:16,marginTop:4}} onClick={confirm}>{t.done}</button>
    </div>
  </>);
}

function Onboarding({onDone}){
  const [userType,setUserType]=useState(null); // null=not chosen, 'worker','student'
  const [step,setStep]=useState(0);
  const [d,setD]=useState({salary:'4000000',currency:'UZS',salaryDay:'25',savings:'0',monthlySavings:'2000000',pocketMoney:'500000',dailyAmount:'50000'});
  const upd=(k,v)=>setD(p=>({...p,[k]:v}));

  const t=T[d.lang||'ru'];

  // User type selection screen
  if(!userType) return(
    <div className="ob-overlay">
      <div className="ob-card pop-in">
        <span className="ob-emoji">👋</span>
        <h2>{t.helloTitle}</h2>
        <p>{t.helloSub}</p>
        
        <div style={{display:'flex', gap:10, marginBottom: 20}}>
          <select className="glass-input" value={d.lang||'ru'} onChange={e=>{upd('lang',e.target.value);}} style={{flex:1}}>
            <option value="ru" style={{color:'#000'}}>🇷🇺 Русский</option>
            <option value="en" style={{color:'#000'}}>🇬🇧 English</option>
          </select>
          <select className="glass-input" value={d.theme||'light'} onChange={e=>{upd('theme',e.target.value); document.documentElement.setAttribute('data-theme',e.target.value);}} style={{flex:1}}>
            <option value="light" style={{color:'#000'}}>☀️ {t.light}</option>
            <option value="dark" style={{color:'#000'}}>🌙 {t.dark}</option>
          </select>
        </div>

        <button className="btn-primary" style={{background:'linear-gradient(135deg,#d4773c,#c05e20)',marginBottom:12}} onClick={()=>{haptic('medium');setUserType('worker');}}>
          {t.workerBtn}
        </button>
        <button className="btn-primary" style={{background:'linear-gradient(135deg,#2d7d46,#1a5c32)'}} onClick={()=>{haptic('medium');setUserType('student');}}>
          {t.studentBtn}
        </button>
      </div>
    </div>
  );
  // Worker steps
  const workerSteps=[
    {emoji:'💰',title:t.yourSalary,sub:t.yourSalarySub,content:(
      <div>
        <div className="input-group" style={{display:'flex',gap:8}}>
          <FormattedInput placeholder="4 000 000" value={d.salary} onChange={v=>upd('salary',v)} style={{flex:1}} lang={d.lang}/>
          <select className="glass-input" value={d.currency} onChange={e=>upd('currency',e.target.value)} style={{width:90}}>
            {CURRENCIES.map(c=><option key={c} style={{background:'var(--bg)'}}>{c}</option>)}
          </select>
        </div>
        <input className="glass-input" type="number" placeholder={t.salaryDayPlace} value={d.salaryDay} onChange={e=>upd('salaryDay',e.target.value)} style={{marginTop:10}}/>
      </div>
    )},
    {emoji:'🍽️',title:t.dailyBudget,sub:t.dailyBudgetSub,content:(
      <div>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:8}}>{t.dailyBudgetHint}</div>
        <div className="input-group">
          <FormattedInput placeholder="50 000" value={d.dailyAmount} onChange={v=>upd('dailyAmount',v)} lang={d.lang}/>
          <span className="input-suffix">{d.currency} {t.perDay}</span>
        </div>
        <div style={{fontSize:12,color:'var(--text3)',marginTop:8}}>≈ {fmtShort((parseFloat(String(d.dailyAmount).replace(/\s/g,''))||0)*22, d.currency, d.lang)} {t.perMonth} (22 {t.workDays})</div>
      </div>
    )},
    {emoji:'💹',title:t.saveAuto,sub:t.saveAutoSub,content:(
      <div>
        <div className="input-group">
          <FormattedInput placeholder="2 000 000" value={d.monthlySavings} onChange={v=>upd('monthlySavings',v)} lang={d.lang}/>
          <span className="input-suffix">{d.currency}</span>
        </div>
      </div>
    )},
    {emoji:'🏦',title:t.saveTarget,sub:t.saveTargetSub,content:(
      <div className="input-group">
        <FormattedInput placeholder="0" value={d.savings} onChange={v=>upd('savings',v)} lang={d.lang}/>
        <span className="input-suffix">{d.currency}</span>
      </div>
    )},
  ];
  // Student steps
  const studentSteps=[
    {emoji:'💵',title:t.pocketMoney,sub:t.pocketMoneySub,content:(
      <div>
        <div className="input-group" style={{display:'flex',gap:8,marginBottom:12}}>
          <FormattedInput placeholder="500 000" value={d.pocketMoney} onChange={v=>upd('pocketMoney',v)} style={{flex:1}} lang={d.lang}/>
          <select className="glass-input" value={d.currency} onChange={e=>upd('currency',e.target.value)} style={{width:90}}>
            {CURRENCIES.map(c=><option key={c} style={{background:'var(--bg)'}}>{c}</option>)}
          </select>
        </div>
        <input className="glass-input" type="number" placeholder={t.pocketDays} value={d.pocketDays||''} onChange={e=>upd('pocketDays',e.target.value)}/>
        <div style={{fontSize:12,color:'var(--text3)',marginTop:8}}>{t.pocketAddLater}</div>
      </div>
    )},
    {emoji:'🍽️',title:t.dailyBudget,sub:t.studentDailySub,content:(
      <div>
        <div className="input-group">
          <FormattedInput placeholder="30 000" value={d.dailyAmount} onChange={v=>upd('dailyAmount',v)} lang={d.lang}/>
          <span className="input-suffix">{d.currency} {t.perDay}</span>
        </div>
      </div>
    )},
    {emoji:'🏦',title:t.saveTarget,sub:t.saveTargetSub,content:(
      <div className="input-group">
        <FormattedInput placeholder="0" value={d.savings} onChange={v=>upd('savings',v)} lang={d.lang}/>
        <span className="input-suffix">{d.currency}</span>
      </div>
    )},
  ];
  const steps=userType==='student'?studentSteps:workerSteps;
  const cur=steps[step];
  const finish=()=>{
    haptic('heavy');
    const iso = new Date().toISOString();
    const initialCats = [];
    const daily = parseFloat(String(d.dailyAmount).replace(/\s/g,'')) || 0;
    if (daily > 0) {
      initialCats.push({
        id: 'lunch-transport',
        name: d.lang === 'en' ? 'Lunch & Transport' : 'Обед + Транспорт',
        icon: '🍽️',
        type: 'workday',
        deductType: 'upfront',
        dailyAmount: daily,
        color: '#e53e3e'
      });
    }
    if(userType==='worker'){
      onDone({userType:'worker',lang:d.lang||'ru',theme:d.theme||'light',salary:parseFloat(d.salary)||4000000,currency:d.currency,salaryDay:parseInt(d.salaryDay)||25,monthlySavings:parseFloat(d.monthlySavings)||0,savingsBalance:parseFloat(d.savings)||0,categories:initialCats,salaryConfirmedAt:iso});
    } else {
      onDone({userType:'student',lang:d.lang||'ru',theme:d.theme||'light',pocketMoney:parseFloat(d.pocketMoney)||0,pocketDays:parseInt(d.pocketDays)||7,pocketStartDate:iso,salary:0,currency:d.currency,salaryDay:0,monthlySavings:0,savingsBalance:parseFloat(d.savings)||0,categories:initialCats,salaryConfirmedAt:iso});
    }
  };
  const next=()=>{ haptic('medium'); if(step<steps.length-1){setStep(s=>s+1);}else{finish();} };
  return(
    <div className="ob-overlay">
      <div className="ob-card pop-in" key={step}>
        <span className="ob-emoji">{cur.emoji}</span>
        <h2>{cur.title}</h2><p>{cur.sub}</p>
        {cur.content}
        <div className="ob-dots" style={{marginTop:cur.content?16:0}}>{steps.map((_,i)=><div key={i} className={`ob-dot${i===step?' active':''}`}/>)}</div>
        <button className="btn-primary" style={{marginTop:8}} onClick={next}>{step<steps.length-1?t.continue:t.letsGo}</button>
        {step>0&&<button className="btn-ghost" onClick={next}>{t.skip}</button>}
        <button className="btn-ghost" style={{marginTop:4,fontSize:12,color:'var(--text3)'}} onClick={()=>{setUserType(null);setStep(0);}}>{t.back}</button>
      </div>
    </div>
  );
}

function Dashboard({data,setData}){
  const t=T[data.lang||'ru'];
  const [sheet,setSheet]=useState(null);
  const [incomeSheet,setIncomeSheet]=useState(false);
  const [chip,setChip]=useState(null);
  const {balance,grossBalance,monthlySav,daysLeft,totalPeriod,dailyBudget,catSpent,elapsed,total,catMonthly,fixedMonthly,fixedPaid,extraIncome,totalIncome,baseSalary,wdElapsed,wdTotal,wdLeft,workdayBudget,leftForMonth,remainingCats,remainingFixed}=calcBalance(data);
  const now=todayDate();
  
  const closestEvents = [...(data.events||[])].filter(e=>new Date(e.date)>=new Date(now.toDateString())).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
  const [showEvForm,setShowEvForm]=useState(false);
  const [evForm,setEvForm]=useState({name:'',date:'',budget:''});
  const addEv=()=>{if(!evForm.name||!evForm.date)return;haptic('medium');setData(d=>({...d,events:[...(d.events||[]),{id:Date.now(),name:evForm.name,date:evForm.date,budget:parseFloat(evForm.budget)||0}]}));setShowEvForm(false);setEvForm({name:'',date:'',budget:''});};
  const progress=Math.max(0,Math.min(100,grossBalance/Math.max(1,totalIncome)*100));
  const h=now.getHours();
  const greeting=data.lang==='en'?(h<12?t.morning:h<17?t.afternoon:t.evening):(h<12?t.morning:h<17?t.afternoon:t.evening);
  const userName=tg?.initDataUnsafe?.user?.first_name||'';
  const todayStr=now.toDateString();
  const showSalary=data.userType!=='student'&&data.salaryDay>0&&now.getDate()>=data.salaryDay&&data.salaryConfirmedMonth!==monthKey()&&data.salaryLastAsked!==todayStr;
  const confirmSalary=()=>{
    haptic('heavy');notify('success');
    const lastResult = balance;
    setData(d=>{
      const nowIso = new Date().toISOString();
      const id = Date.now();
      let next={...d,salaryConfirmedMonth:monthKey(),salaryLastAsked:null,salaryConfirmedAt:nowIso,lastMonthResult:lastResult};
      // Auto-deposit the fixed monthly savings amount
      if(d.monthlySavings>0){
        next.savingsBalance=(d.savingsBalance||0)+d.monthlySavings;
        next.savingsHistory=[...(d.savingsHistory||[]),{id,date:nowIso,type:'deposit',amount:d.monthlySavings,note:t.autoSavingsLog}];
        // Also log this as an expense from main balance in general history
        next = logActivity(next, {type:'expense', label:t.autoSavingsLog, amount:d.monthlySavings, color:'#c0392b'});
      }
      notifySalary(d.salary,d.monthlySavings,d.currency,d.lang);
      return logActivity(next,{type:'income',label:t.salaryConfirmedLog,amount:d.salary,color:'#2d7d46'});
    });
  };
  const dismissSalaryTomorrow=()=>{
    haptic('light');
    setData(d=>({...d,salaryLastAsked:todayStr}));
    notifySalaryPending(data.lang);
  };
  const thisMonthBig=(data.bigExpenses||[]).filter(be=>{const bd=new Date(be.date);return bd.getMonth()===now.getMonth()&&bd.getFullYear()===now.getFullYear();});
  const thisSpent=thisMonthBig.filter(b=>!b.fromSavings).reduce((s,b)=>s+b.amount,0)+catSpent+fixedPaid;
  const lastSpent=data.lastMonthSpent||0;
  const cmpPct=lastSpent>0?Math.round((thisSpent-lastSpent)/lastSpent*100):null;
  const addBig=(amount,extras)=>{
    const exp={id:Date.now(),name:extras.name||t.largeExpenseDefault,icon:'💸',amount,date:now.toISOString(),fromSavings:extras.fromSavings||false};
    setData(d=>{
      const next={...d,bigExpenses:[...(d.bigExpenses||[]),exp]};
      if(extras.fromSavings){
        next.savingsBalance=Math.max(0,(d.savingsBalance||0)-amount);
        next.savingsHistory=[...(d.savingsHistory||[]),{id:Date.now()+1,date:exp.date,type:'withdraw',amount,note:extras.name||t.largeExpenseDefault}];
      }
      notifyBigExpense(extras.name||t.largeExpenseDefault,amount,d.currency,d.lang);
      return logActivity(next,{id:exp.id,type:'expense',label:extras.name||t.largeExpenseDefault,amount,color:'#c0392b',date:exp.date});
    });
    setChip(`-${fmtShort(amount, data.currency, data.lang)}`);setSheet(null);setTimeout(()=>setChip(null),700);
  };
  const addIncome=(amount,extras)=>{
    haptic('medium');notify('success');
    const entry={id:Date.now(),amount,note:extras?.name||t.extraIncomeDefault,date:now.toISOString()};
    setData(d=>{
      const next={...d,incomeEntries:[...(d.incomeEntries||[]),entry]};
      if(d.userType==='student') next.pocketMoney=(d.pocketMoney||0)+amount;
      return logActivity(next,{id:entry.id,type:'income',label:entry.note,amount,color:'#2d7d46',date:entry.date});
    });
    setChip(`+${fmtShort(amount, data.currency, data.lang)}`);setIncomeSheet(false);setTimeout(()=>setChip(null),700);
  };
  return(
    <div className="page">
      <div className="page-hdr fade-up">
        <div style={{fontSize:13,color:'var(--text2)'}}>{greeting}{userName?', '+userName:''} 👋</div>
        <h1>{t.home}</h1>
      </div>
      <div className="balance-card fade-up d1">
        <div className="bal-label">{t.available}</div>
        <div className="bal-amount">{fmt(balance,data.currency,data.lang)}</div>
        <div className="bal-sub">
          {data.userType==='student'?t.pocketMoney:t.salary}: {fmt(totalIncome,data.currency,data.lang)}
          {data.lastMonthResult !== 0 && (
            <span style={{marginLeft:8, opacity:0.8}}>
              ({t.vsLastMonth}: <span style={{color:data.lastMonthResult>0?'#9ae6b4':'#feb2b2'}}>{data.lastMonthResult>0?'+':''}{fmtShort(data.lastMonthResult, data.currency, data.lang)}</span>)
            </span>
          )}
        </div>
        <div className="pbar-wrap"><div className="pbar-fill" style={{width:progress+'%'}}/></div>
        <div className="pbar-labels"><span>{daysLeft} {t.daysLeft}</span><span>{Math.round(100-progress)}% {t.spentLower}</span></div>
      </div>
      <div className="breakdown-card fade-up d1">
        <div className="bd-row"><span className="label">{data.userType==='student'?`💵 ${t.pocketMoney}`:`💰 ${t.salary}`}</span><span className="val">{fmt(baseSalary,data.currency,data.lang)}</span></div>
        {extraIncome>0&&<div className="bd-row"><span className="label">➕ {t.extraIncomeBtn.substring(2)}</span><span className="val" style={{color:'var(--green)'}}>{fmt(extraIncome,data.currency,data.lang)}</span></div>}
        <div className="bd-row"><span className="label">🍽️ {t.autoExpenses} ({t.spentLower})</span><span className="val" style={{color:'var(--coral)'}}>-{fmt(catSpent,data.currency,data.lang)}</span></div>
        {fixedPaid>0&&<div className="bd-row"><span className="label">📱 {t.subscriptions} ({t.spentLower})</span><span className="val" style={{color:'var(--coral)'}}>-{fmt(fixedPaid,data.currency,data.lang)}</span></div>}
        <div className="bd-divider"/>
        <div className="bd-row bd-total"><span className="label">{t.available}</span><span className="val">{fmt(balance,data.currency,data.lang)}</span></div>
        <div style={{height:10}}/>
        <div className="bd-row" style={{opacity:0.7,fontSize:11}}><span className="label">{t.plannedUntilEnd}</span><span className="val">-{fmt(remainingCats + remainingFixed, data.currency, data.lang)}</span></div>
        <div className="bd-row bd-total"><span className="label">{t.leftForMonthLabel}</span><span className="val" style={{color:leftForMonth>=0?'var(--green)':'var(--coral)'}}>{fmt(leftForMonth,data.currency,data.lang)}</span></div>
      </div>
      {showSalary&&(
        <div className="card fade-up d2" style={{margin:'0 20px 12px',padding:'16px'}}>
          <div style={{fontSize:13,fontWeight:700,marginBottom:4}}>💸 {t.salaryOfDate} {now.getDate()}</div>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>{fmt(data.salary,data.currency,data.lang)}{data.monthlySavings>0?` · ${t.saveAuto} ${fmt(data.monthlySavings,data.currency,data.lang)}`:''}</div>
          <div style={{display:'flex',gap:8}}>
            <button className="btn-primary" style={{flex:2,margin:0,padding:'11px 0',background:'linear-gradient(135deg,#2d7d46,#1a5c32)'}} onClick={confirmSalary}>{t.salaryConfirmed}</button>
            <button className="btn-ghost" style={{flex:1,margin:0,padding:'11px 0',fontSize:12}} onClick={dismissSalaryTomorrow}>{t.salaryNotYet}</button>
          </div>
        </div>
      )}
      <div className="daily-card fade-up d2">
        <div style={{fontSize:26}}>💡</div>
        <div style={{flex:1}}>
          <div className="dc-label">{t.youCanSpend}</div>
          <div className="dc-amount">{fmt(dailyBudget,data.currency,data.lang)}</div>
          <div className="dc-days">
            {data.userType==='worker'
              ? `${daysLeft} ${t.daysUntilSalary}`
              : `${daysLeft} ${t.daysLeftOf} ${totalPeriod}`}
          </div>
        </div>
      </div>
      {cmpPct!==null&&(
        <div className="cmp-card fade-up d3">
          <div className="cmp-icon">📊</div>
          <div className="cmp-info"><div className="cmp-title">{t.vsLastMonth}</div><div className="cmp-val">{fmt(thisSpent,data.currency,data.lang)}</div></div>
          <span className={`cmp-badge ${cmpPct<=0?'better':'worse'}`}>{cmpPct<=0?'▼':'▲'} {Math.abs(cmpPct)}%</span>
        </div>
      )}
      {/* Merged auto-expenses */}
      {(data.categories||[]).length>0&&(
        <div className="cat-merged-card fade-up d3">
          <div className="cat-merged-header">
            <div className="cat-merged-title">🍽️ {t.autoExpenses}</div>
            <div className="cat-merged-total">-{fmtShort(catSpent, data.currency, data.lang)} / {fmtShort(catMonthly, data.currency, data.lang)}</div>
          </div>
          <div className="pbar-wrap" style={{marginBottom:12}}><div className="pbar-fill" style={{width:Math.min(100,catSpent/catMonthly*100)+'%',background:'var(--coral)'}}/></div>
          {(data.categories||[]).map(c=>{
            let s = 0, limit = 0;
            if (c.type === 'workday') {
              s = (c.dailyAmount||0)*wdElapsed;
              limit = (c.dailyAmount||0)*wdTotal;
            } else if (c.deductType === 'upfront') {
              s = limit = c.monthlyLimit || 0;
            } else {
              s = (c.monthlyLimit/total)*elapsed;
              limit = c.monthlyLimit || 0;
            }
            return(<div className="cat-sub-row" key={c.id}>
              <div className="cat-sub-icon">{c.icon}</div>
              <div className="cat-sub-name">{c.name} {c.type==='workday'&&<span style={{fontSize:10,color:'var(--text3)'}}>({t.workDays})</span>}</div>
              <div className="cat-sub-val">{fmtShort(s, data.currency, data.lang)} / {fmtShort(limit, data.currency, data.lang)}</div>
            </div>);
          })}
        </div>
      )}
      {(data.fixedExpenses||[]).length>0&&(
        <div className="fixed-list fade-up d4">
          <div className="sec-title" style={{padding:0,marginBottom:8}}>📱 {t.subscriptions}</div>
          {(data.fixedExpenses||[]).map(fe=>(
            <div className="fixed-tile" key={fe.id}>
              <div className="ft-icon">{fe.icon}</div>
              <div className="ft-info"><div className="ft-name">{fe.name}</div><div className="ft-day">{fe.day}-го числа</div></div>
              <div className="ft-amount">-{fmtShort(fe.amount)}</div>
            </div>
          ))}
        </div>
      )}
      <div className="sec-title fade-up d4" style={{marginTop:4}}>{t.largeExpenses}</div>
      <div className="big-list fade-up d5">
        {thisMonthBig.length===0&&<div style={{textAlign:'center',color:'var(--text3)',padding:'16px 0',fontSize:13}}>{t.noLargeExpenses}</div>}
        {thisMonthBig.map(be=>(
          <div className="big-item" key={be.id}>
            <div className="bi-icon">{be.icon}</div>
            <div className="bi-info">
              <div className="bi-name">{be.name}{be.fromSavings&&<span className="bi-savings-tag">{t.saved}</span>}</div>
              <div className="bi-date">{fmtDate(be.date, data.lang)}</div>
            </div>
            <div className="bi-amount" style={{color:be.fromSavings?'var(--blue)':'var(--coral)'}}>-{fmt(be.amount,data.currency,data.lang)}</div>
          </div>
        ))}
        <button className="add-btn" onClick={()=>{haptic('light');setSheet(true);}}>{t.addBigExpense}</button>
      </div>
      {/* Extra income button */}
      <div style={{padding:'0 20px',marginBottom:20}}>
        <button className="add-btn" style={{borderColor:'var(--green)',color:'var(--green)',background:'var(--green-soft)'}} onClick={()=>{haptic('light');setIncomeSheet(true);}}>
          {data.userType==='student'?t.studentExtraBtn:t.extraIncomeBtn}
        </button>
        {/* this month extra income entries */}
        {(data.incomeEntries||[]).filter(e=>{const d=new Date(e.date);return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}).map(e=>(
          <div className="sav-history-item" key={e.id} style={{marginBottom:5}}>
            <div className="shi-icon">💵</div>
            <div className="shi-info"><div className="shi-note">{e.note}</div><div className="shi-date">{fmtDate(e.date, data.lang)}</div></div>
            <div className="shi-amount in">+{fmt(e.amount,data.currency,data.lang)}</div>
          </div>
        ))}
      </div>
      
      <div className="sec-title fade-up" style={{marginTop:4}}>🎉 {t.nearestEvents}</div>
      <div style={{padding:'0 20px',marginBottom:20}}>
        {closestEvents.length===0&&<div style={{textAlign:'center',color:'var(--text3)',padding:'16px 0',fontSize:13}}>{t.noEvents}</div>}
        {closestEvents.map((ev,i)=>{
          const d=new Date(ev.date);const dl=Math.ceil((d-now)/86400000);const mon=d.toLocaleString(data.lang==='en'?'en-US':'ru-RU',{month:'short'}).replace('.','');
          const isW=dl>=0&&dl<=7,isM=dl>7&&dl<=30;
          return(<div className="event-card fade-up" key={ev.id} style={{animationDelay:i*0.05+'s', borderColor:isW?'rgba(217,119,6,.3)':undefined}}>
            <div className="ev-date-box" style={isW?{background:'var(--gold-soft)'}:{}}>
              <div className="ev-day" style={isW?{color:'var(--gold)'}:{}}>{d.getDate()}</div>
              <div className="ev-mon" style={isW?{color:'var(--gold)'}:{}}>{mon}</div>
            </div>
            <div style={{flex:1}}>
              <div className="ev-name">{ev.name}</div>
              <div className="ev-sub">{dl===0?`🎉 ${t.today}!`:dl===1?`${t.yesterday}!`:t.inDays.replace('{n}',dl)}</div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',marginTop:3}}>
                {isW&&<span className="ev-badge week">⚡ {dl} {t.days}</span>}
                {isM&&<span className="ev-badge month">📅 {dl} {t.days}</span>}
                {ev.budget>0&&<span className="ev-badge budget">💰 {fmtShort(ev.budget, data.currency, data.lang)}</span>}
              </div>
            </div>
            <button style={{background:'none',border:'none',color:'var(--text3)',fontSize:14,cursor:'pointer',padding:4}} onClick={()=>{haptic('medium');setData(d=>({...d,events:(d.events||[]).filter(x=>x.id!==ev.id)}))}}>✕</button>
          </div>);
        })}
        {showEvForm?(
          <div className="card fade-up" style={{padding:14,marginBottom:8}}>
            <input className="glass-input" placeholder={t.eventName} value={evForm.name} onChange={e=>setEvForm(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
            <input className="glass-input" type="date" value={evForm.date} onChange={e=>setEvForm(p=>({...p,date:e.target.value}))} style={{marginBottom:10,colorScheme:'light'}}/>
            <FormattedInput placeholder={t.eventBudget} value={evForm.budget} onChange={v=>setEvForm(p=>({...p,budget:v}))} style={{marginBottom:12}} lang={data.lang}/>
            <button className="btn-primary" onClick={addEv}>{t.addEvent.substring(2)}</button>
            <button className="btn-ghost" onClick={()=>setShowEvForm(false)}>{t.cancel}</button>
          </div>
        ):(
          <button className="add-btn fade-up" onClick={()=>{haptic('light');setShowEvForm(true);}}>{t.addEvent}</button>
        )}
      </div>

      {sheet&&<NumPadSheet title={t.largeExpenseDefault} currency={data.currency} onClose={()=>setSheet(null)} onConfirm={addBig} showSavings showName lang={data.lang}/>}
      {incomeSheet&&<NumPadSheet title={t.extraIncomeDefault} currency={data.currency} onClose={()=>setIncomeSheet(false)} onConfirm={addIncome} showName lang={data.lang}/>}
      {chip&&<FlyChip text={chip} onDone={()=>setChip(null)}/>}
    </div>
  );
}

function BudgetPage({data,setData}){
  const t=T[data.lang||'ru'];
  const [showCF,setShowCF]=useState(false);
  const [showFF,setShowFF]=useState(false);
  const [showCon,setShowCon]=useState(false);
  const [catE,setCatE]=useState({id:'',name:'',monthlyLimit:'',dailyAmount:'',type:'daily',deductType:'daily',startMonth:monthKey()});
  const [fixE,setFixE]=useState({id:'',name:'',amount:'',day:'1'});
  const [conE,setConE]=useState({name:'',totalAmount:'',installments:[{percent:25,dueDate:''}]});
  const [selIcon,setSelIcon]=useState('🍔');
  const saveCat=()=>{
    if(!catE.name||(!catE.monthlyLimit && !catE.dailyAmount))return;haptic('medium');
    setData(d=>{
      const cats=d.categories||[];
      const common = {name:catE.name,icon:selIcon,color:catE.color||'#e53e3e',type:catE.type,deductType:catE.deductType,startMonth:catE.startMonth};
      if(catE.type==='workday') {
        common.dailyAmount = parseFloat(catE.dailyAmount)||0;
        common.monthlyLimit = 0;
      } else {
        common.monthlyLimit = parseFloat(catE.monthlyLimit)||0;
        common.dailyAmount = 0;
      }
      if(catE.id) return {...d,categories:cats.map(x=>x.id===catE.id?{...x,...common}:x)};
      return {...d,categories:[...cats,{id:Date.now().toString(),...common}]};
    });
    setShowCF(false);setCatE({id:'',name:'',monthlyLimit:'',dailyAmount:'',type:'daily',deductType:'daily',startMonth:monthKey()});
  };
  const saveFix=()=>{
    if(!fixE.name||!fixE.amount)return;haptic('medium');
    setData(d=>{
      const fxs=d.fixedExpenses||[];
      if(fixE.id) return {...d,fixedExpenses:fxs.map(x=>x.id===fixE.id?{...x,name:fixE.name,icon:selIcon,amount:parseFloat(fixE.amount),day:parseInt(fixE.day)||1}:x)};
      return {...d,fixedExpenses:[...fxs,{id:Date.now().toString(),name:fixE.name,icon:selIcon,amount:parseFloat(fixE.amount),day:parseInt(fixE.day)||1}]};
    });
    setShowFF(false);setFixE({id:'',name:'',amount:'',day:'1'});
  };
  const saveCon=()=>{if(!conE.name||!conE.totalAmount)return;haptic('medium');setData(d=>({...d,contracts:[...(d.contracts||[]),{id:Date.now().toString(),name:conE.name,icon:selIcon,totalAmount:parseFloat(conE.totalAmount),installments:conE.installments.map((x,i)=>({id:i,percent:x.percent,dueDate:x.dueDate,paid:false,amount:parseFloat(conE.totalAmount)*x.percent/100}))}]}));setShowCon(false);setConE({name:'',totalAmount:'',installments:[{percent:25,dueDate:''}]});};
  const togglePaid=(cid,iid)=>{haptic('medium');setData(d=>({...d,contracts:(d.contracts||[]).map(c=>c.id===cid?{...c,installments:c.installments.map((ins,i)=>(ins.id===iid||i===iid)?{...ins,paid:!ins.paid}:ins)}:c)}));};
  return(
    <div className="page">
      <div className="page-hdr fade-up"><h1>{t.budget}</h1></div>
      <div className="sec-title">{t.autoExpenses}</div>
      <div className="fixed-list fade-up d1">
        {(data.categories||[]).map(c=>(
          showCF && catE.id === c.id ? (
            <div className="card" key={c.id} style={{padding:16,marginTop:4,marginBottom:8}}>
              <div className="icon-row">{ICONS.slice(0,10).map(ic=><span key={ic} className={`icon-opt${selIcon===ic?' selected':''}`} onClick={()=>setSelIcon(ic)}>{ic}</span>)}</div>
              <input className="glass-input" placeholder={t.eventName} value={catE.name} onChange={e=>setCatE(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
              {catE.type==='workday' ? (
                <FormattedInput placeholder={t.dailyBudget} value={catE.dailyAmount} onChange={v=>setCatE(p=>({...p,dailyAmount:v}))} style={{marginBottom:10}} lang={data.lang}/>
              ) : (
                <FormattedInput placeholder={t.limitMonth} value={catE.monthlyLimit} onChange={v=>setCatE(p=>({...p,monthlyLimit:v}))} style={{marginBottom:10}} lang={data.lang}/>
              )}
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                <button className={`btn-sm ${catE.type==='workday'?'active':''}`} style={{flex:1,padding:'8px',background:catE.type==='workday'?'var(--accent-soft)':'var(--surface2)',color:catE.type==='workday'?'var(--accent)':'var(--text2)',borderColor:catE.type==='workday'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,type:'workday'}))}>{t.workDays}</button>
                <button className={`btn-sm ${catE.type!=='workday'?'active':''}`} style={{flex:1,padding:'8px',background:catE.type!=='workday'?'var(--accent-soft)':'var(--surface2)',color:catE.type!=='workday'?'var(--accent)':'var(--text2)',borderColor:catE.type!=='workday'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,type:'daily'}))}>{t.allDays}</button>
              </div>
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                <button className={`btn-sm ${catE.deductType==='daily'?'active':''}`} style={{flex:1,padding:'8px',background:catE.deductType==='daily'?'var(--accent-soft)':'var(--surface2)',color:catE.deductType==='daily'?'var(--accent)':'var(--text2)',borderColor:catE.deductType==='daily'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,deductType:'daily'}))}>{t.partMonth}</button>
                <button className={`btn-sm ${catE.deductType==='upfront'?'active':''}`} style={{flex:1,padding:'8px',background:catE.deductType==='upfront'?'var(--accent-soft)':'var(--surface2)',color:catE.deductType==='upfront'?'var(--accent)':'var(--text2)',borderColor:catE.deductType==='upfront'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,deductType:'upfront'}))}>{t.immediatelyMonth}</button>
              </div>
              <div style={{fontSize:11,color:'var(--text2)',marginBottom:6}}>{t.startFrom}</div>
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                <button className={`btn-sm ${catE.startMonth===monthKey()?'active':''}`} style={{flex:1,padding:'8px',background:catE.startMonth===monthKey()?'var(--accent-soft)':'var(--surface2)',color:catE.startMonth===monthKey()?'var(--accent)':'var(--text2)',borderColor:catE.startMonth===monthKey()?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,startMonth:monthKey()}))}>{t.now}</button>
                <button className={`btn-sm ${catE.startMonth!==monthKey()?'active':''}`} style={{flex:1,padding:'8px',background:catE.startMonth!==monthKey()?'var(--accent-soft)':'var(--surface2)',color:catE.startMonth!==monthKey()?'var(--accent)':'var(--text2)',borderColor:catE.startMonth!==monthKey()?'var(--accent)':'var(--border)'}} onClick={()=>{const n=new Date();const nm=new Date(n.getFullYear(),n.getMonth()+1,1);setCatE(p=>({...p,startMonth:`${nm.getFullYear()}-${String(nm.getMonth()).padStart(2,'0')}`}))}}>{data.userType==='student'?t.nextMonth:t.nextSalary}</button>
              </div>
              <button className="btn-primary" onClick={saveCat}>{t.save}</button><button className="btn-ghost" onClick={()=>{setShowCF(false);setCatE({id:'',name:'',monthlyLimit:'',dailyAmount:'',type:'daily',deductType:'daily',startMonth:monthKey()});}}>{t.cancel}</button>
            </div>
          ) : (
            <div className="fixed-tile" key={c.id} style={{borderLeft:`3px solid ${c.color||'var(--coral)'}`,cursor:'pointer'}} onClick={()=>{setCatE({id:c.id,name:c.name,monthlyLimit:c.monthlyLimit,dailyAmount:c.dailyAmount,type:c.type||'daily',deductType:c.deductType||'daily',startMonth:c.startMonth||monthKey()});setSelIcon(c.icon);setShowCF(true);}}><div className="ft-icon">{c.icon}</div><div className="ft-info"><div className="ft-name">{c.name} {c.type==='workday'?<span style={{fontSize:10,color:'var(--text3)'}}>({t.workDays})</span>:c.deductType==='upfront'?<span style={{fontSize:10,color:'var(--blue)'}}>{t.immediatelyMonth}</span>:null}</div><div className="ft-day">{c.type==='workday'?fmt(c.dailyAmount,data.currency,data.lang)+'/'+t.perDay.substring(2):fmt(c.monthlyLimit,data.currency,data.lang)+' / '+t.mo}</div></div><button className="btn-sm" style={{color:'var(--coral)'}} onClick={(e)=>{e.stopPropagation();haptic('medium');setData(d=>({...d,categories:(d.categories||[]).filter(x=>x.id!==c.id)}))}}>✕</button></div>
          )
        ))}
        {showCF && !catE.id ? (
          <div className="card" style={{padding:16,marginTop:4}}>
            <div className="icon-row">{ICONS.slice(0,10).map(ic=><span key={ic} className={`icon-opt${selIcon===ic?' selected':''}`} onClick={()=>setSelIcon(ic)}>{ic}</span>)}</div>
            <input className="glass-input" placeholder={t.eventName} value={catE.name} onChange={e=>setCatE(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
            {catE.type==='workday' ? (
              <FormattedInput placeholder={t.dailyBudget} value={catE.dailyAmount} onChange={v=>setCatE(p=>({...p,dailyAmount:v}))} style={{marginBottom:10}} lang={data.lang}/>
            ) : (
              <FormattedInput placeholder={t.limitMonth} value={catE.monthlyLimit} onChange={v=>setCatE(p=>({...p,monthlyLimit:v}))} style={{marginBottom:10}} lang={data.lang}/>
            )}
            <div style={{display:'flex',gap:6,marginBottom:12}}>
              <button className={`btn-sm ${catE.type==='workday'?'active':''}`} style={{flex:1,padding:'8px',background:catE.type==='workday'?'var(--accent-soft)':'var(--surface2)',color:catE.type==='workday'?'var(--accent)':'var(--text2)',borderColor:catE.type==='workday'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,type:'workday'}))}>{t.workDays}</button>
              <button className={`btn-sm ${catE.type!=='workday'?'active':''}`} style={{flex:1,padding:'8px',background:catE.type!=='workday'?'var(--accent-soft)':'var(--surface2)',color:catE.type!=='workday'?'var(--accent)':'var(--text2)',borderColor:catE.type!=='workday'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,type:'daily'}))}>{t.allDays}</button>
            </div>
            <div style={{display:'flex',gap:6,marginBottom:12}}>
              <button className={`btn-sm ${catE.deductType==='daily'?'active':''}`} style={{flex:1,padding:'8px',background:catE.deductType==='daily'?'var(--accent-soft)':'var(--surface2)',color:catE.deductType==='daily'?'var(--accent)':'var(--text2)',borderColor:catE.deductType==='daily'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,deductType:'daily'}))}>{t.partMonth}</button>
              <button className={`btn-sm ${catE.deductType==='upfront'?'active':''}`} style={{flex:1,padding:'8px',background:catE.deductType==='upfront'?'var(--accent-soft)':'var(--surface2)',color:catE.deductType==='upfront'?'var(--accent)':'var(--text2)',borderColor:catE.deductType==='upfront'?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,deductType:'upfront'}))}>{t.immediatelyMonth}</button>
            </div>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:6}}>{t.startFrom}</div>
            <div style={{display:'flex',gap:6,marginBottom:12}}>
              <button className={`btn-sm ${catE.startMonth===monthKey()?'active':''}`} style={{flex:1,padding:'8px',background:catE.startMonth===monthKey()?'var(--accent-soft)':'var(--surface2)',color:catE.startMonth===monthKey()?'var(--accent)':'var(--text2)',borderColor:catE.startMonth===monthKey()?'var(--accent)':'var(--border)'}} onClick={()=>setCatE(p=>({...p,startMonth:monthKey()}))}>{t.now}</button>
              <button className={`btn-sm ${catE.startMonth!==monthKey()?'active':''}`} style={{flex:1,padding:'8px',background:catE.startMonth!==monthKey()?'var(--accent-soft)':'var(--surface2)',color:catE.startMonth!==monthKey()?'var(--accent)':'var(--text2)',borderColor:catE.startMonth!==monthKey()?'var(--accent)':'var(--border)'}} onClick={()=>{const n=new Date();const nm=new Date(n.getFullYear(),n.getMonth()+1,1);setCatE(p=>({...p,startMonth:`${nm.getFullYear()}-${String(nm.getMonth()).padStart(2,'0')}`}))}}>{data.userType==='student'?t.nextMonth:t.nextSalary}</button>
            </div>
            <button className="btn-primary" onClick={saveCat}>{t.save}</button><button className="btn-ghost" onClick={()=>{setShowCF(false);setCatE({id:'',name:'',monthlyLimit:'',dailyAmount:'',type:'daily',deductType:'daily'});}}>{t.cancel}</button>
          </div>
        ) : !showCF && <button className="add-btn" onClick={()=>{haptic('light');setSelIcon('🍔');setCatE({id:'',name:'',monthlyLimit:'',dailyAmount:'',type:'daily',deductType:'daily',startMonth:monthKey()});setShowCF(true);}}>{t.addCategory}</button>}
      </div>
      <div className="sec-title" style={{marginTop:6}}>{t.subscriptions}</div>
      <div className="fixed-list fade-up d2">
        {(data.fixedExpenses||[]).map(fe=>(
          showFF && fixE.id === fe.id ? (
            <div className="card" key={fe.id} style={{padding:16,marginTop:4,marginBottom:8}}>
              <div className="icon-row">{ICONS.map(ic=><span key={ic} className={`icon-opt${selIcon===ic?' selected':''}`} onClick={()=>setSelIcon(ic)}>{ic}</span>)}</div>
              <input className="glass-input" placeholder={t.subscription} value={fixE.name} onChange={e=>setFixE(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
              <FormattedInput placeholder={t.limitMonth} value={fixE.amount} onChange={v=>setFixE(p=>({...p,amount:v}))} style={{marginBottom:10}} lang={data.lang}/>
              <input className="glass-input" type="number" placeholder={t.billingDay} value={fixE.day} onChange={e=>setFixE(p=>({...p,day:e.target.value}))} style={{marginBottom:12}}/>
              <button className="btn-primary" onClick={saveFix}>{t.save}</button><button className="btn-ghost" onClick={()=>{setShowFF(false);setFixE({id:'',name:'',amount:'',day:'1'});}}>{t.cancel}</button>
            </div>
          ) : (
            <div className="fixed-tile" key={fe.id} style={{cursor:'pointer'}} onClick={()=>{setFixE({id:fe.id,name:fe.name,amount:fe.amount,day:fe.day});setSelIcon(fe.icon);setShowFF(true);}}><div className="ft-icon">{fe.icon}</div><div className="ft-info"><div className="ft-name">{fe.name}</div><div className="ft-day">{fmt(fe.amount,data.currency,data.lang)} · {fe.day} {t.mo}</div></div><button className="btn-sm" style={{color:'var(--coral)'}} onClick={(e)=>{e.stopPropagation();haptic('medium');setData(d=>({...d,fixedExpenses:(d.fixedExpenses||[]).filter(x=>x.id!==fe.id)}))}}>✕</button></div>
          )
        ))}
        {showFF && !fixE.id ? (
          <div className="card" style={{padding:16,marginTop:4}}>
            <div className="icon-row">{ICONS.map(ic=><span key={ic} className={`icon-opt${selIcon===ic?' selected':''}`} onClick={()=>setSelIcon(ic)}>{ic}</span>)}</div>
            <input className="glass-input" placeholder={t.subscription} value={fixE.name} onChange={e=>setFixE(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
            <FormattedInput placeholder={t.limitMonth} value={fixE.amount} onChange={v=>setFixE(p=>({...p,amount:v}))} style={{marginBottom:10}} lang={data.lang}/>
            <input className="glass-input" type="number" placeholder={t.billingDay} value={fixE.day} onChange={e=>setFixE(p=>({...p,day:e.target.value}))} style={{marginBottom:12}}/>
            <button className="btn-primary" onClick={saveFix}>{t.save}</button><button className="btn-ghost" onClick={()=>{setShowFF(false);setFixE({id:'',name:'',amount:'',day:'1'});}}>{t.cancel}</button>
          </div>
        ) : !showFF && <button className="add-btn" onClick={()=>{haptic('light');setSelIcon('💪');setFixE({id:'',name:'',amount:'',day:'1'});setShowFF(true);}}>{t.addSubscription}</button>}
      </div>
      <div className="sec-title" style={{marginTop:6}}>🎓 {t.contracts}</div>
      <div style={{padding:'0 20px'}}>
        {(data.contracts||[]).map(con=>(
          <div className="contract-card" key={con.id}>
            <div className="contract-name">{con.icon} {con.name}</div>
            <div className="contract-total">{t.total} {fmt(con.totalAmount,data.currency,data.lang)}</div>
            {con.installments.map((ins,i)=>(
              <div className="contract-payment" key={i}>
                <div className="cp-pct">{ins.percent}%</div>
                <div className="cp-info"><div className="cp-amount">{fmt(ins.amount,data.currency,data.lang)}</div>{ins.dueDate&&<div className="cp-date">{t.due} {new Date(ins.dueDate).toLocaleDateString(data.lang==='en'?'en-US':'ru-RU',{day:'2-digit',month:'long'})}</div>}</div>
                <button className={`cp-paid ${ins.paid?'yes':'no'}`} onClick={()=>togglePaid(con.id,ins.id??i)}>{ins.paid?`✓ ${t.paid}`:t.unpaid}</button>
              </div>
            ))}
            <button className="btn-sm" style={{marginTop:8,color:'var(--coral)',width:'100%'}} onClick={()=>{haptic('medium');setData(d=>({...d,contracts:(d.contracts||[]).filter(x=>x.id!==con.id)}))}}>{t.delete}</button>
          </div>
        ))}
        {showCon?(<div className="card fade-up" style={{padding:16,marginBottom:12}}>
          <div className="icon-row">{['🎓','🏥','🏠','✈️','🎯'].map(ic=><span key={ic} className={`icon-opt${selIcon===ic?' selected':''}`} onClick={()=>setSelIcon(ic)}>{ic}</span>)}</div>
          <input className="glass-input" placeholder={t.contractTitlePlace} value={conE.name} onChange={e=>setConE(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
          <FormattedInput placeholder={t.contractTotalPlace} value={conE.totalAmount} onChange={v=>setConE(p=>({...p,totalAmount:v}))} style={{marginBottom:10}} lang={data.lang}/>
          <div style={{fontSize:12,color:'var(--text2)',marginBottom:8}}>{t.contractInstallments}</div>
          {conE.installments.map((ins,i)=>(
            <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
              <FormattedInput placeholder="%" value={ins.percent} onChange={v=>setConE(p=>({...p,installments:p.installments.map((x,j)=>j===i?{...x,percent:parseFloat(v)||0}:x)}))} style={{width:70}} lang={data.lang}/>
              <input className="glass-input" type="date" value={ins.dueDate} onChange={e=>setConE(p=>({...p,installments:p.installments.map((x,j)=>j===i?{...x,dueDate:e.target.value}:x)}))} style={{flex:1,colorScheme:'light'}}/>
              {i>0&&<button className="btn-sm" style={{color:'var(--coral)',padding:'8px'}} onClick={()=>setConE(p=>({...p,installments:p.installments.filter((_,j)=>j!==i)}))}>✕</button>}
            </div>
          ))}
          <button className="btn-sm" style={{marginBottom:12,width:'100%'}} onClick={()=>setConE(p=>({...p,installments:[...p.installments,{percent:25,dueDate:''}]}))}>{t.addInstallment}</button>
          <button className="btn-primary" onClick={saveCon}>{t.save}</button>
          <button className="btn-ghost" onClick={()=>setShowCon(false)}>{t.cancel}</button>
        </div>):(<button className="add-btn" onClick={()=>{haptic('light');setSelIcon('🎓');setShowCon(true);}}>{t.addContract}</button>)}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

function SavingsPage({data,setData}){
  const t=T[data.lang||'ru'];
  const [showAdd,setShowAdd]=useState(false);
  const [addSheet,setAddSheet]=useState(false);
  const [wdSheet,setWdSheet]=useState(false);
  const [gForm,setGForm]=useState({name:'',target:'',monthly:''});
  const [selIcon,setSelIcon]=useState('🎯');
  const goalIcons=['🎯','📱','🚗','✈️','🏠','💍','👟','🎮','💻','🎓'];
  const deposit=(amount,extras)=>{haptic('medium');notify('success');setData(d=>({...d,savingsBalance:(d.savingsBalance||0)+amount,savingsHistory:[...(d.savingsHistory||[]),{id:Date.now(),date:new Date().toISOString(),type:'deposit',amount,note:extras?.name||t.savingsHistoryDeposit}]}));setAddSheet(false);};
  const withdraw=(amount,extras)=>{haptic('medium');notify('success');setData(d=>({...d,savingsBalance:Math.max(0,(d.savingsBalance||0)-amount),savingsHistory:[...(d.savingsHistory||[]),{id:Date.now(),date:new Date().toISOString(),type:'withdraw',amount,note:extras?.name||t.savingsHistoryWithdraw}]}));setWdSheet(false);};
  const saveGoal=()=>{if(!gForm.name||!gForm.target)return;haptic('medium');setData(d=>({...d,savingsGoals:[...(d.savingsGoals||[]),{id:Date.now(),name:gForm.name,target:parseFloat(gForm.target),monthly:parseFloat(gForm.monthly)||0,saved:0,icon:selIcon}]}));setShowAdd(false);setGForm({name:'',target:'',monthly:''});};
  return(
    <div className="page">
      <div className="page-hdr fade-up"><h1>{t.savings} 🏦</h1></div>
      <div className="sav-balance-card fade-up d1">
        <div className="sav-label">{t.saved}</div>
        <div className="sav-amount">{fmt(data.savingsBalance||0,data.currency,data.lang)}</div>
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <button className="btn-sm" style={{background:'rgba(255,255,255,0.2)',color:'#fff',flex:1,padding:'10px',border:'1px solid rgba(255,255,255,0.3)'}} onClick={()=>setAddSheet(true)}>{t.deposit}</button>
          <button className="btn-sm" style={{background:'rgba(255,255,255,0.2)',color:'#fff',flex:1,padding:'10px',border:'1px solid rgba(255,255,255,0.3)'}} onClick={()=>setWdSheet(true)}>{t.withdraw}</button>
        </div>
      </div>
      {(data.savingsHistory||[]).length>0&&<>
        <div className="sec-title fade-up d2">{t.history}</div>
        <div style={{padding:'0 20px',marginBottom:16}}>
          {[...(data.savingsHistory||[])].reverse().slice(0,20).map(h=>(
            <div className="sav-history-item" key={h.id}>
              <div className="shi-icon">{h.type==='deposit'?'📥':'📤'}</div>
              <div className="shi-info"><div className="shi-note">{h.note}</div><div className="shi-date">{fmtDate(h.date, data.lang)}</div></div>
              <div className={`shi-amount ${h.type==='deposit'?'in':'out'}`}>{h.type==='deposit'?'+':'-'}{fmt(h.amount,data.currency,data.lang)}</div>
            </div>
          ))}
        </div>
      </>}
      <div className="sec-title fade-up d3">{t.goals}</div>
      <div style={{padding:'0 20px'}}>
        {(data.savingsGoals||[]).map((g,i)=>{
          const pct=Math.min(100,Math.round(g.saved/g.target*100));
          return(<div className="card sav-goal-card fade-up" key={g.id} style={{animationDelay:i*0.06+'s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
              <div><div className="sav-goal-name">{g.icon} {g.name}</div><div className="sav-goal-sub">{fmt(g.saved,data.currency,data.lang)} {t.from} {fmt(g.target,data.currency,data.lang)}{g.monthly>0&&` · ${fmtShort(g.monthly, data.currency, data.lang)}/${t.mo}`}</div></div>
              <div style={{fontSize:20,fontWeight:900,color:'var(--blue)'}}>{pct}%</div>
            </div>
            <div className="pbar-wrap"><div className="pbar-fill" style={{width:pct+'%',background:'linear-gradient(90deg,var(--blue),var(--purple))'}}/></div>
            <div style={{display:'flex',gap:8,marginTop:10}}>
              <button className="btn-sm" style={{background:'var(--green-soft)',color:'var(--green)',flex:1}} onClick={()=>{haptic('light');const amt=parseInt(prompt(t.howMuchToSave));if(amt>0)setData(d=>({...d,savingsBalance:Math.max(0,(d.savingsBalance||0)-amt),savingsGoals:(d.savingsGoals||[]).map(x=>x.id===g.id?{...x,saved:x.saved+amt}:x),savingsHistory:[...(d.savingsHistory||[]),{id:Date.now(),date:new Date().toISOString(),type:'deposit',amount:amt,note:'→ '+g.name}]}));}}>{t.saveGoalBtn}</button>
              <button className="btn-sm" style={{color:'var(--coral)'}} onClick={()=>{haptic('medium');setData(d=>({...d,savingsGoals:(d.savingsGoals||[]).filter(x=>x.id!==g.id)}))}}>✕</button>
            </div>
          </div>);
        })}
        {showAdd?(<div className="card fade-up" style={{padding:16,marginBottom:12}}>
          <div className="icon-row">{goalIcons.map(ic=><span key={ic} className={`icon-opt${selIcon===ic?' selected':''}`} onClick={()=>setSelIcon(ic)}>{ic}</span>)}</div>
          <input className="glass-input" placeholder={t.goalNamePlace} value={gForm.name} onChange={e=>setGForm(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
          <FormattedInput placeholder={t.targetAmount} value={gForm.target} onChange={v=>setGForm(p=>({...p,target:v}))} style={{marginBottom:10}} lang={data.lang}/>
          <FormattedInput placeholder={t.monthlyDeposit+' '+t.optional} value={gForm.monthly} onChange={v=>setGForm(p=>({...p,monthly:v}))} style={{marginBottom:12}} lang={data.lang}/>
          <button className="btn-primary" onClick={saveGoal}>{t.save}</button>
          <button className="btn-ghost" onClick={()=>setShowAdd(false)}>{t.cancel}</button>
        </div>):(<button className="add-btn fade-up" onClick={()=>{haptic('light');setShowAdd(true);}}>{t.addGoal}</button>)}
        <div style={{height:20}}/>
      </div>
      {addSheet&&<NumPadSheet title={'+ '+t.deposit} currency={data.currency} onClose={()=>setAddSheet(false)} onConfirm={deposit} showName lang={data.lang}/>}
      {wdSheet&&<NumPadSheet title={'− '+t.withdraw} currency={data.currency} onClose={()=>setWdSheet(false)} onConfirm={withdraw} showName lang={data.lang}/>}
    </div>
  );
}

function EventsPage({data,setData}){
  const t=T[data.lang||'ru'];
  const [showForm,setShowForm]=useState(false);
  const [form,setForm]=useState({name:'',date:'',budget:''});
  const now=todayDate();
  const addEvent=()=>{if(!form.name||!form.date)return;haptic('medium');setData(d=>({...d,events:[...(d.events||[]),{id:Date.now(),name:form.name,date:form.date,budget:parseFloat(form.budget)||0}]}));setShowForm(false);setForm({name:'',date:'',budget:''});};
  const sorted=[...(data.events||[])].sort((a,b)=>new Date(a.date)-new Date(b.date));
  return(
    <div className="page">
      <div className="page-hdr fade-up"><h1>{t.events} 🎉</h1></div>
      <div style={{padding:'0 20px'}}>
        {sorted.map((ev,i)=>{
          const d=new Date(ev.date);const dl=Math.ceil((d-now)/86400000);const mon=d.toLocaleString(data.lang==='en'?'en-US':'ru-RU',{month:'short'}).replace('.','');
          const isW=dl>=0&&dl<=7,isM=dl>7&&dl<=30,isPast=dl<0;
          return(<div className="event-card fade-up" key={ev.id} style={{animationDelay:i*0.06+'s',opacity:isPast?.6:1,borderColor:isW?'rgba(217,119,6,.3)':undefined}}>
            <div className="ev-date-box" style={isW?{background:'var(--gold-soft)'}:isPast?{background:'var(--surface2)'}:{}}>
              <div className="ev-day" style={isW?{color:'var(--gold)'}:isPast?{color:'var(--text3)'}:{}}>{d.getDate()}</div>
              <div className="ev-mon" style={isW?{color:'var(--gold)'}:isPast?{color:'var(--text3)'}:{}}>{mon}</div>
            </div>
            <div className="ev-info" style={{flex:1}}>
              <div className="ev-name">{ev.name}</div>
              <div className="ev-sub">{isPast?t.ago.replace('{n}',Math.abs(dl)):dl===0?`🎉 ${t.today}!`:dl===1?(data.lang==='en'?t.tomorrow:t.tomorrow):dl>0?t.inDays.replace('{n}',dl):''}</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:4}}>
                {isW&&<span className="ev-badge week">⚡ {dl} {t.days}</span>}
                {isM&&<span className="ev-badge month">📅 {dl} {t.days}</span>}
                {ev.budget>0&&<span className="ev-badge budget">💰 {fmtShort(ev.budget, data.currency, data.lang)}</span>}
              </div>
            </div>
            <button style={{background:'none',border:'none',color:'var(--text3)',fontSize:16,cursor:'pointer',padding:4}} onClick={()=>{haptic('medium');setData(d=>({...d,events:(d.events||[]).filter(x=>x.id!==ev.id)}))}}>✕</button>
          </div>);
        })}
        {showForm?(<div className="card fade-up" style={{padding:16,marginBottom:12}}>
          <input className="glass-input" placeholder={t.eventName} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
          <input className="glass-input" type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={{marginBottom:10,colorScheme:'light'}}/>
          <FormattedInput placeholder={t.eventBudget} value={form.budget} onChange={v=>setForm(p=>({...p,budget:v}))} style={{marginBottom:12}} lang={data.lang}/>
          <button className="btn-primary" onClick={addEvent}>{t.confirm}</button>
          <button className="btn-ghost" onClick={()=>setShowForm(false)}>{t.cancel}</button>
        </div>):(<button className="add-btn fade-up" onClick={()=>{haptic('light');setShowForm(true);}}>{t.addEvent}</button>)}
        <div style={{height:20}}/>
      </div>
    </div>
  );
}

function SettingsPage({data,setData}){
  const t=T[data.lang||'ru'];
  const [feedbackText,setFeedbackText]=useState('');
  const sendFeedback=async ()=>{
    if(!feedbackText.trim())return;
    haptic('medium');
    try {
      const uname = tg?.initDataUnsafe?.user?.username || tg?.initDataUnsafe?.user?.first_name || 'Аноним';
      const uid = tg?.initDataUnsafe?.user?.id || 0;
      await fetch('https://keepit-app.vercel.app/api/feedback', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_name: uname, user_id: uid, text: feedbackText})
      });
    } catch(e) {}
    alert(t.lang==='en'?'Thank you for your feedback! We will definitely consider it.':'Спасибо за ваш отзыв! Мы обязательно его рассмотрим.');
    setFeedbackText('');
  };
  const resetAll=()=>{if(!window.confirm(t.resetConfirm))return;haptic('heavy');localStorage.clear();window.location.reload();};
  return(
    <div className="page">
      <div className="page-hdr fade-up"><h1>⚙️ {t.settings}</h1></div>
      <div className="sec-title">{t.theme}</div>
      <div className="theme-toggle-row fade-up d1">
        {[['light','☀️',t.light],['dark','🌙',t.dark]].map(([val,icon,label])=>(
          <button key={val} className={`theme-opt${data.theme===val?' active':''}`} onClick={()=>{haptic('light');setData(d=>({...d,theme:val}));}}>
            <span className="to-icon">{icon}</span><span className="to-label">{label}</span>
          </button>
        ))}
      </div>
      <div className="sec-title">{t.language}</div>
      <div className="settings-group fade-up d2">
        {Object.entries(LANGS).map(([code,name])=>(
          <div className="settings-row" key={code} onClick={()=>{haptic('light');setData(d=>({...d,lang:code}));}} style={{cursor:'pointer'}}>
            <div className="sr-icon">{code==='ru'?'🇷🇺':'🇬🇧'}</div>
            <div className="sr-label">{name}</div>
            {data.lang===code&&<div style={{color:'var(--blue)',fontWeight:900}}>✓</div>}
          </div>
        ))}
      </div>
      <div className="sec-title">{t.currency}</div>
      <div className="settings-group fade-up d2">
        <div className="settings-row">
          <div className="sr-icon">💱</div>
          <div className="sr-label">{t.currency}</div>
          <select value={data.currency} onChange={e=>{haptic('light');setData(d=>({...d,currency:e.target.value}));}}>
            {CURRENCIES.map(c=><option key={c} style={{background:'var(--bg)'}}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="sec-title">{t.salary}</div>
      <div className="settings-group fade-up d3">
        <div className="settings-row">
          <div className="sr-icon">💰</div>
          <div className="sr-label">{t.salary}</div>
          <FormattedInput value={data.salary} onChange={v=>setData(d=>({...d,salary:parseFloat(v)||0}))} style={{background:'none',border:'none',color:'var(--blue)',fontWeight:700,fontFamily:'inherit',fontSize:13,width:130,textAlign:'right',outline:'none'}} lang={data.lang}/>
        </div>
        <div className="settings-row">
          <div className="sr-icon">📅</div>
          <div className="sr-label">{t.paydaySett}</div>
          <input type="number" min="1" max="31" value={data.salaryDay} onChange={e=>setData(d=>({...d,salaryDay:parseInt(e.target.value)||1}))} style={{background:'none',border:'none',color:'var(--blue)',fontWeight:700,fontFamily:'inherit',fontSize:13,width:50,textAlign:'right',outline:'none'}}/>
        </div>
        <div className="settings-row">
          <div className="sr-icon">💹</div>
          <div className="sr-label">{t.autoSavingsMo}</div>
          <FormattedInput value={data.monthlySavings||0} onChange={v=>setData(d=>({...d,monthlySavings:parseFloat(v)||0}))} style={{background:'none',border:'none',color:'var(--blue)',fontWeight:700,fontFamily:'inherit',fontSize:13,width:130,textAlign:'right',outline:'none'}} lang={data.lang}/>
        </div>
        <div className="settings-row">
          <div className="sr-icon">🏦</div>
          <div className="sr-label">{t.savingsBalance}</div>
          <FormattedInput value={data.savingsBalance||0} onChange={v=>setData(d=>({...d,savingsBalance:parseFloat(v)||0}))} style={{background:'none',border:'none',color:'var(--blue)',fontWeight:700,fontFamily:'inherit',fontSize:13,width:130,textAlign:'right',outline:'none'}} lang={data.lang}/>
        </div>
      </div>
      <div className="sec-title fade-up d3">{t.feedback}</div>
      <div className="settings-group fade-up d3" style={{padding:16,display:'flex',flexDirection:'column'}}>
        <textarea className="glass-input" placeholder={t.feedbackPlaceholder} value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} style={{minHeight:80,marginBottom:12,resize:'vertical',padding:12}}/>
        <button className="btn-primary" onClick={sendFeedback} style={{margin:0}}>{t.feedbackSubmit}</button>
      </div>
      <div className="sec-title fade-up d3">{t.tgNotifications}</div>
      <div className="settings-group fade-up d4">
        <div className="settings-row">
          <div className="sr-icon">🔔</div>
          <div className="sr-label" style={{fontSize:13}}>{t.tgDesc1}</div>
          <div style={{fontSize:11,color:'var(--green)',fontWeight:700}}>✓ {t.auto}</div>
        </div>
        <div className="settings-row" style={{flexDirection:'column',alignItems:'flex-start',gap:6}}>
          <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.6}}>
            {t.tgDesc2}
          </div>
          <div style={{fontSize:12,color:'var(--text3)',lineHeight:1.8}}>
            {t.tgDesc3.split('\n').map((line,i)=><div key={i}>{line}</div>)}
          </div>
        </div>
        <div className="settings-row">
          <button className="btn-sm" style={{width:'100%',background:'var(--accent-soft)',color:'var(--accent)',borderColor:'var(--accent)'}} onClick={()=>{
            haptic('medium');
            const msgs = [
              '🤖 Кожаный мешок, я работаю! Твои деньги под моим присмотром.',
              '💸 Тест пройден! Я слежу за каждой твоей копейкой 👀',
              '🚀 Вжух! И твои финансы в космосе. Проверка связи!',
              '🍔 Хватит тратить на еду! (Это просто тест, расслабься)',
              '🔔 Дзинь-дзинь! Копилка на связи, всё работает отлично!'
            ];
            const randomMsg = msgs[Math.floor(Math.random()*msgs.length)];
            try {
              if (window.Telegram?.WebApp?.sendData) {
                window.Telegram.WebApp.sendData(JSON.stringify({action: 'notify', text: randomMsg}));
              } else {
                alert('Функция отправки данных не поддерживается в этом режиме Telegram. Откройте приложение через кнопку меню бота.');
              }
            } catch(e) {
              alert('Ошибка при отправке: ' + e.message);
            }
          }}>
            {t.tgTest}
          </button>
        </div>
      </div>
      <div style={{padding:'0 20px',marginTop:8,paddingBottom:20}}>
        <button className="btn-ghost" style={{color:'var(--coral)',borderColor:'rgba(229,62,62,0.25)'}} onClick={resetAll}>🗑️ {t.reset}</button>
      </div>
      <div style={{textAlign:'center',color:'var(--text3)',fontSize:12,paddingBottom:24}}>KeepIt v2.0 · Made with ❤️</div>
    </div>
  );
}

const NAV_ICONS={
  home:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  budget:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>,
  debts:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
  history:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
  settings:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.61-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.12 7.12 0 0 0-1.61.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.6l2.03 1.58a7.2 7.2 0 0 0-.07.94c0 .32.02.64.07.94L2.86 14.5c-.18.14-.23.41-.12.6l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.12 7.12 0 0 0 1.61-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.6l-2.01-1.56zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/></svg>,
};

function DebtsPage({data,setData}){
  const t=T[data.lang||'ru'];
  const [showForm,setShowForm]=useState(false);
  const [partialId,setPartialId]=useState(null);
  const [form,setForm]=useState({name:'',amount:'',type:'owe',note:'',dueDate:''});
  const addDebt=()=>{
    if(!form.name||!form.amount)return;haptic('medium');
    const debt={id:Date.now(),name:form.name,amount:parseFloat(form.amount),type:form.type,note:form.note,dueDate:form.dueDate,paid:false,paidAmount:0,createdAt:new Date().toISOString()};
    setData(d=>{
      notifyDebt(debt.name,debt.amount,debt.type,d.currency,d.lang);
      return logActivity({...d,debts:[...(d.debts||[]),debt]},{type:'debt',label:form.type==='owe'?`${t.debtOweLog}${form.name}`:`${t.debtLentLog}${form.name}`,amount:parseFloat(form.amount),color:'#c0392b'});
    });
    setShowForm(false);setForm({name:'',amount:'',type:'owe',note:'',dueDate:''});
  };
  const markPaid=(id)=>{
    haptic('medium');notify('success');
    setData(d=>{
      const debt=(d.debts||[]).find(x=>x.id===id);
      const isInc=debt?.type==='owed';
      notifyDebtPaid(debt?.name||'',debt?.amount||0,d.currency,d.lang);
      return logActivity(
        {...d,debts:(d.debts||[]).map(x=>x.id===id?{...x,paid:true,paidAmount:x.amount,paidAt:new Date().toISOString()}:x)},
        {type:isInc?'income':'expense',label:`${t.debtClosedLog}${debt?.name||''}`,amount:(debt?.amount||0)-(debt?.paidAmount||0),color:isInc?'#2d7d46':'#c0392b'}
      );
    });
  };
  const handlePartial=(amt)=>{
    if(!partialId) return;
    const debt=(data.debts||[]).find(x=>x.id===partialId);
    if(!debt) return;
    const remaining=debt.amount-(debt.paidAmount||0);
    const pay=Math.min(amt,remaining);
    if(pay<=0) {setPartialId(null); return;}
    haptic('medium');notify('success');
    setData(d=>{
      const isInc=debt.type==='owed';
      const newPaid=(debt.paidAmount||0)+pay;
      const isPaid=newPaid>=debt.amount;
      const ndebts=(d.debts||[]).map(x=>x.id===partialId ? {...x, paidAmount:newPaid, paid:isPaid, paidAt:isPaid?new Date().toISOString():x.paidAt} : x);
      const label = isPaid ? `${t.debtClosedLog}${debt.name}` : `${t.partially} ${debt.type==='owe'?t.debtReturnedLog:t.debtReceivedLog}: ${debt.name}`;
      return logActivity({...d, debts:ndebts},{type:isInc?'income':'expense',label,amount:pay,color:isInc?'#2d7d46':'#c0392b'});
    });
    setPartialId(null);
  };
  const iOwe=(data.debts||[]).filter(d=>d.type==='owe'&&!d.paid);
  const owedToMe=(data.debts||[]).filter(d=>d.type==='owed'&&!d.paid);
  const paid=(data.debts||[]).filter(d=>d.paid);
  const totalOwe=iOwe.reduce((s,d)=>s+(d.amount-(d.paidAmount||0)),0);
  const totalOwed=owedToMe.reduce((s,d)=>s+(d.amount-(d.paidAmount||0)),0);
  return(
    <div className="page" style={{paddingBottom:80}}>
      <div className="page-hdr fade-up"><h1>💸 {t.debts}</h1></div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'0 20px',marginBottom:14}}>
        <div className="card" style={{padding:14,textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>{t.iOwe}</div>
          <div style={{fontSize:18,fontWeight:800,color:'var(--coral)'}}>{fmtShort(totalOwe, data.currency, data.lang)}</div>
          <div style={{fontSize:11,color:'var(--text3)'}}>{iOwe.length}</div>
        </div>
        <div className="card" style={{padding:14,textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>{t.owedToMe}</div>
          <div style={{fontSize:18,fontWeight:800,color:'var(--green)'}}>{fmtShort(totalOwed, data.currency, data.lang)}</div>
          <div style={{fontSize:11,color:'var(--text3)'}}>{owedToMe.length}</div>
        </div>
      </div>
      {iOwe.length>0&&<>
        <div className="debt-section-hdr"><span>{t.iOwe}</span><span className="total" style={{color:'var(--coral)'}}>{fmt(totalOwe,data.currency, data.lang)}</span></div>
        <div style={{padding:'0 20px'}}>
          {iOwe.map(d=>(
            <div className="debt-card" key={d.id}>
              <div className="debt-icon owe">💸</div>
              <div className="debt-info">
                <div className="debt-name">{d.name}</div>
                <div className="debt-meta">{d.note||''}{d.dueDate?` · ${t.due} ${new Date(d.dueDate).toLocaleDateString(data.lang==='en'?'en-US':'ru-RU',{day:'2-digit',month:'short'})}`:''}</div>
                {d.paidAmount>0&&<div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{t.debtPaidAlready} {fmtShort(d.paidAmount, data.currency, data.lang)} / {fmtShort(d.amount, data.currency, data.lang)}</div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                <div className="debt-amount owe">-{fmt(d.amount-(d.paidAmount||0),data.currency, data.lang)}</div>
                <div style={{display:'flex',gap:6}}>
                  <button className="debt-paid" style={{background:'var(--surface2)',color:'var(--text2)',padding:'6px 10px'}} onClick={()=>{haptic('light');setPartialId(d.id);}}>{t.paidPart}</button>
                  <button className="debt-paid" style={{padding:'6px 10px'}} onClick={()=>markPaid(d.id)}>{t.paidAll}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}
      {owedToMe.length>0&&<>
        <div className="debt-section-hdr" style={{marginTop:8}}><span>{t.owedToMe}</span><span className="total" style={{color:'var(--green)'}}>{fmt(totalOwed,data.currency, data.lang)}</span></div>
        <div style={{padding:'0 20px'}}>
          {owedToMe.map(d=>(
            <div className="debt-card" key={d.id}>
              <div className="debt-icon owed">🤝</div>
              <div className="debt-info">
                <div className="debt-name">{d.name}</div>
                <div className="debt-meta">{d.note||''}{d.dueDate?` · ${t.due} ${new Date(d.dueDate).toLocaleDateString(data.lang==='en'?'en-US':'ru-RU',{day:'2-digit',month:'short'})}`:''}</div>
                {d.paidAmount>0&&<div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{t.debtReturnedAlready} {fmtShort(d.paidAmount, data.currency, data.lang)} / {fmtShort(d.amount, data.currency, data.lang)}</div>}
              </div>
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6}}>
                <div className="debt-amount owed">+{fmt(d.amount-(d.paidAmount||0),data.currency, data.lang)}</div>
                <div style={{display:'flex',gap:6}}>
                  <button className="debt-paid" style={{background:'var(--surface2)',color:'var(--text2)',padding:'6px 10px'}} onClick={()=>{haptic('light');setPartialId(d.id);}}>{t.paidPart}</button>
                  <button className="debt-paid" style={{padding:'6px 10px'}} onClick={()=>markPaid(d.id)}>{t.paidAll}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>}
      <div style={{padding:'0 20px',marginTop:8}}>
        {showForm?(
          <div className="card fade-up" style={{padding:16,marginBottom:10}}>
            <div style={{display:'flex',gap:8,marginBottom:12}}>
              {[['owe',`💸 ${t.iOwe}`],['owed',`🤝 ${t.owedToMe}`]].map(([val,label])=>(
                <button key={val} className="btn-sm" style={{flex:1,padding:10,borderColor:form.type===val?'var(--accent)':'var(--border)',color:form.type===val?'var(--accent)':'var(--text2)',background:form.type===val?'var(--accent-soft)':'var(--surface2)'}} onClick={()=>setForm(p=>({...p,type:val}))}>{label}</button>
              ))}
            </div>
            <input className="glass-input" placeholder={t.debtName} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
            <FormattedInput placeholder={`${t.debtAmount} (${data.currency})`} value={form.amount} onChange={v=>setForm(p=>({...p,amount:v}))} style={{marginBottom:10,background:'none',border:'1px solid var(--border)',padding:'10px',borderRadius:8,width:'100%',boxSizing:'border-box'}} lang={data.lang}/>
            <input className="glass-input" placeholder={t.debtNote} value={form.note} onChange={e=>setForm(p=>({...p,note:e.target.value}))} style={{marginBottom:10}}/>
            <input className="glass-input" type="date" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} style={{marginBottom:12,colorScheme:'light'}}/>
            <button className="btn-primary" onClick={addDebt}>{t.addDebt.substring(2)}</button>
            <button className="btn-ghost" onClick={()=>setShowForm(false)}>{t.cancel}</button>
          </div>
        ):(
          <button className="add-btn fade-up" onClick={()=>{haptic('light');setShowForm(true);}}>{t.addDebt}</button>
        )}
      </div>
      {paid.length>0&&<>
        <div className="sec-title" style={{marginTop:8}}>✅ {t.closed}</div>
        <div style={{padding:'0 20px',marginBottom:16}}>
          {paid.map(d=>(
            <div className="debt-card" key={d.id} style={{opacity:.6}}>
              <div className="debt-icon" style={{background:'var(--border)'}}>{d.type==='owe'?'💸':'🤝'}</div>
              <div className="debt-info"><div className="debt-name" style={{textDecoration:'line-through'}}>{d.name}</div><div className="debt-meta">{d.paidAt?`${t.done} ${fmtDate(d.paidAt, data.lang)}`:''}</div></div>
              <div className="debt-amount" style={{color:'var(--text3)'}}>{fmt(d.amount,data.currency, data.lang)}</div>
            </div>
          ))}
        </div>
      </>}
      {partialId && (
        <NumPadSheet 
          title={t.partially} 
          currency={data.currency} 
          onClose={()=>setPartialId(null)} 
          onConfirm={handlePartial} 
          lang={data.lang}
        />
      )}
    </div>
  );
}

function HistoryPage({data,setData}){
  const t=T[data.lang||'ru'];
  const now=todayDate();
  const [viewDate, setViewDate] = useState(()=>new Date(now.getFullYear(), now.getMonth(), 1));
  const m=viewDate.getMonth(), y=viewDate.getFullYear();
  const {catSpent,catMonthly,fixedPaid,elapsed,total}=calcBalance(data);
  const [filter, setFilter] = useState('all');

  const downloadCSV = () => {
    haptic('light');
    let csv = `${t.today},${t.historyOp},${t.addCategory.substring(2)},${t.debtAmount}\n`;
    filteredItems.forEach(i => {
      csv += `${fmtDate(i.date, data.lang)},"${i.name}","${i.sub}",${Math.abs(i.amount).toFixed(0)}\n`;
    });
    const blob = new Blob(["\uFEFF"+csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KeepIt_History_${y}_${m+1}.csv`;
    a.click();
  };

  // Build this month's activity feed
  const items=[];

  const isCurrentMonth = m === now.getMonth() && y === now.getFullYear();
  const isPastMonth = y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth());
  const vTotal = daysInMonth(y,m);
  const vElapsed = isPastMonth ? vTotal : (isCurrentMonth ? now.getDate() : 0);
  const vWdElapsed = isPastMonth ? workdaysInMonth(y,m) : (isCurrentMonth ? countWorkdays(y,m,1,now.getDate()) : 0);
  const vWdTotal = workdaysInMonth(y,m);

  // Virtual Salary
  if (data.userType !== 'student' && data.salary > 0 && vElapsed >= data.salaryDay) {
    const hasLog = (data.activityLog||[]).some(a=>{
      const ad = new Date(a.date);
      return ad.getMonth()===m && ad.getFullYear()===y && (a.label.includes('Зарплата') || a.label.includes('Salary'));
    });
    if(!hasLog) {
      items.push({id:'v_salary',icon:'💰',name:t.salaryLog,sub:t.auto,amount:data.salary,color:'#2d7d46',date:new Date(y,m,data.salaryDay,9,0).toISOString()});
    }
  }

  // Category auto-expenses
  (data.categories||[]).forEach(c=>{
    let s = 0;
    if (c.deductType === 'upfront') {
      s = c.monthlyLimit || ((c.dailyAmount||0)*vWdTotal);
    } else {
      if (c.type === 'workday') s = (c.dailyAmount||0)*vWdElapsed;
      else s = (c.monthlyLimit/vTotal)*vElapsed;
    }
    if(s>0) items.push({id:'cat_'+c.id,icon:c.icon,name:c.name,sub:c.deductType==='upfront'?t.immediatelyMonth:t.autoExpenseAccum,amount:-s,color:'#c0392b',date:new Date(y,m,Math.max(1,vElapsed)).toISOString()});
  });
  // Fixed expenses paid this month
  (data.fixedExpenses||[]).filter(fe=>fe.day<=vElapsed).forEach(fe=>{
    items.push({id:'fe_'+fe.id,icon:fe.icon,name:fe.name,sub:`${t.subscription} · ${fe.day}-го`,amount:-fe.amount,color:'#c0392b',date:new Date(y,m,fe.day,10,0).toISOString()});
  });
  // Big expenses this month
  (data.bigExpenses||[]).filter(be=>{const bd=new Date(be.date);return bd.getMonth()===m&&bd.getFullYear()===y;}).forEach(be=>{
    items.push({id:'be_'+be.id,icon:be.icon,name:be.name,sub:be.fromSavings?t.fromSavings:t.expenses.substring(0,t.expenses.length-1),amount:-be.amount,color:be.fromSavings?'#2563eb':'#c0392b',date:be.date});
  });
  // Savings history this month
  (data.savingsHistory||[]).filter(h=>{const hd=new Date(h.date);return hd.getMonth()===m&&hd.getFullYear()===y;}).forEach(h=>{
    const isDup = (data.bigExpenses||[]).some(b => b.fromSavings && b.date === h.date);
    if (!isDup) {
      items.push({id:'sh_'+h.id,icon:h.type==='deposit'?'📥':'📤',name:h.note||t.savings,sub:t.savings,amount:h.type==='deposit'?-h.amount:h.amount,color:h.type==='deposit'?'#2d7d46':'#c0392b',date:h.date});
    }
  });
  // Extra income entries this month
  (data.incomeEntries||[]).filter(ie=>{const id=new Date(ie.date);return id.getMonth()===m&&id.getFullYear()===y;}).forEach(ie=>{
    items.push({id:'ie_'+ie.id,icon:'💵',name:ie.note||t.extraIncomeDefault,sub:t.income,amount:ie.amount,color:'#2d7d46',date:ie.date});
  });
  // Debts this month
  (data.debts||[]).filter(d=>{const dd=new Date(d.createdAt);return dd.getMonth()===m&&dd.getFullYear()===y;}).forEach(d=>{
    items.push({id:'debt_'+d.id,icon:d.type==='owe'?'💸':'🤝',name:d.name,sub:d.type==='owe'?t.iOwe:t.owedToMe,amount:d.type==='owe'?-d.amount:d.amount,color:d.type==='owe'?'#c0392b':'#2d7d46',date:d.createdAt});
  });
  // Activity log (Actual transactions)
  (data.activityLog||[]).filter(a=>{const ad=new Date(a.date);return ad.getMonth()===m&&ad.getFullYear()===y;}).forEach(a=>{
    // Check if this activity is already represented by other specialized lists
    const aTime = new Date(a.date).getTime();
    const isBig = (data.bigExpenses||[]).some(be => (be.id === a.id || Math.abs(new Date(be.date).getTime() - aTime) < 2000) && be.amount === a.amount);
    const isSav = (data.savingsHistory||[]).some(sh => (sh.id === a.id || Math.abs(new Date(sh.date).getTime() - aTime) < 2000) && sh.amount === a.amount);
    const isInc = (data.incomeEntries||[]).some(ie => (ie.id === a.id || Math.abs(new Date(ie.date).getTime() - aTime) < 2000) && ie.amount === a.amount);
    
    if (!isBig && !isSav && !isInc) {
      const isPositive = a.type === 'income' || (a.type === 'debt_paid' && (a.label.includes(t.debtReturnedLog) || a.label.includes(t.debtReceivedLog)));
      items.push({
        id: 'act_'+a.id,
        icon: a.type === 'income' ? '💰' : (a.type==='expense'?'📤':'📋'),
        name: a.label,
        sub: t.historyOp,
        amount: isPositive ? a.amount : -a.amount,
        color: a.color || (isPositive ? '#2d7d46' : '#c0392b'),
        date: a.date
      });
    }
  });

  const totalIn=items.filter(i=>i.amount>0).reduce((s,i)=>s+i.amount,0);
  const totalOut=items.filter(i=>i.amount<0).reduce((s,i)=>s+Math.abs(i.amount),0);

  // Filter and sort items
  items.sort((a,b)=>new Date(b.date)-new Date(a.date));
  const filteredItems = items.filter(i => {
    if(filter==='income') return i.amount > 0;
    if(filter==='expense') return i.amount < 0;
    return true;
  });

  // Group by date
  const grouped = {};
  const todayStr = now.toDateString();
  const yesterdayStr = new Date(now.getTime() - 86400000).toDateString();
  filteredItems.forEach(i => {
    const d = new Date(i.date);
    const ds = d.toDateString();
    let key = d.toLocaleDateString(data.lang==='en'?'en-US':'ru-RU', {day:'numeric', month:'long'});
    if(ds === todayStr) key = `${t.today}, ` + key;
    else if(ds === yesterdayStr) key = `${t.yesterday}, ` + key;
    
    if(!grouped[key]) grouped[key] = [];
    grouped[key].push(i);
  });

  return(
    <div className="page">
      <div className="page-hdr fade-up" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <h1>📊 {t.history}</h1>
          <p>{viewDate.toLocaleString(data.lang==='en'?'en-US':'ru-RU',{month:'long',year:'numeric'})}</p>
        </div>
        <div style={{display:'flex',gap:4}}>
          <button className="btn-ghost" style={{padding:'6px 12px',margin:0,minWidth:'auto'}} onClick={()=>{haptic('light');setViewDate(new Date(y,m-1,1))}}>⬅️</button>
          <button className="btn-ghost" style={{padding:'6px 12px',margin:0,minWidth:'auto'}} onClick={()=>{haptic('light');setViewDate(new Date(y,m+1,1))}}>➡️</button>
        </div>
      </div>
      {/* Month summary */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,padding:'0 20px',marginBottom:14}}>
        <div className="card" style={{padding:14,textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>{t.expenses}</div>
          <div style={{fontSize:18,fontWeight:800,color:'var(--coral)'}}>{fmtShort(totalOut, data.currency, data.lang)}</div>
        </div>
        <div className="card" style={{padding:14,textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>{t.income}</div>
          <div style={{fontSize:18,fontWeight:800,color:'var(--green)'}}>{fmtShort(totalIn, data.currency, data.lang)}</div>
        </div>
      </div>
      
      {/* Filter Row */}
      <div style={{display:'flex',gap:8,padding:'0 20px',marginBottom:16}}>
        {[['all',t.all],['expense',t.expenses],['income',t.income]].map(([val,label])=>(
          <button key={val} className={`btn-sm ${filter===val?'active':''}`} 
            style={{flex:1, padding:'8px 0', 
                    background:filter===val?'var(--accent-soft)':'var(--surface2)', 
                    color:filter===val?'var(--accent)':'var(--text2)',
                    borderColor:filter===val?'var(--accent)':'var(--border)'}} 
            onClick={()=>{haptic('light');setFilter(val);}}>{label}</button>
        ))}
      </div>
      
      <div style={{padding:'0 20px',marginBottom:16}}>
        <button className="btn-ghost" style={{width:'100%',color:'var(--blue)',borderColor:'rgba(37,99,235,0.3)',marginBottom:16}} onClick={downloadCSV}>{t.downloadCSV} ({viewDate.toLocaleString(data.lang==='en'?'en-US':'ru-RU',{month:'long'})})</button>
        {Object.keys(grouped).length===0&&<div style={{textAlign:'center',color:'var(--text3)',padding:'20px 0',fontSize:13}}>{t.noHistory}</div>}
        {Object.entries(grouped).map(([dateLabel, dayItems]) => (
          <div key={dateLabel} style={{marginBottom: 16}}>
            <div style={{fontSize: 13, color: 'var(--text2)', marginBottom: 8, fontWeight: 700}}>{dateLabel}</div>
            {dayItems.map((item,i)=>(
              <div className="history-item fade-up" key={item.id} style={{animationDelay:i*0.02+'s'}}>
                <div className="hi-dot" style={{background:item.color}}/>
                <div className="hi-info">
                  <div className="hi-name">{item.icon} {item.name}</div>
                  <div className="hi-sub">{item.sub}</div>
                </div>
                <div className="hi-amount" style={{color:item.amount>=0?'var(--green)':'var(--coral)'}}>{item.amount>=0?'+':''}{fmtShort(Math.abs(item.amount), data.currency, data.lang)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function App(){
  const [isReady, setIsReady]=useState(false);
  const [onboarded,setOnboarded]=useState(()=>load('onboarded',false));
  const [tab,setTab]=useState('home');
  const [data,setDataRaw]=useState(()=>({...DEFAULT_DATA,...load('data',{})}));
  const setData=upd=>setDataRaw(prev=>{const next=typeof upd==='function'?upd(prev):{...prev,...upd};save('data',next);return next;});
  
  useEffect(()=>{
    tg?.ready();tg?.expand();
    if (tg?.CloudStorage) {
      try {
        tg.CloudStorage.getKeys((err, keys) => {
          if (!err && keys && keys.includes('k2_data')) {
            tg.CloudStorage.getItem('k2_data', (e, v) => {
              if (!e && v) {
                try {
                  const cloudData = JSON.parse(v);
                  setDataRaw(prev => ({...prev, ...cloudData}));
                  localStorage.setItem('k2_data', v);
                } catch(err){}
              }
              tg.CloudStorage.getItem('k2_onboarded', (e2, v2) => {
                 if(!e2 && v2 === 'true') {
                   setOnboarded(true);
                   localStorage.setItem('k2_onboarded', 'true');
                 }
                 setIsReady(true);
              });
            });
          } else {
            const loc = localStorage.getItem('k2_data');
            if (loc) {
              try { tg.CloudStorage.setItem('k2_data', loc); } catch(e){}
              try { tg.CloudStorage.setItem('k2_onboarded', localStorage.getItem('k2_onboarded')||'false'); } catch(e){}
            }
            setIsReady(true);
          }
        });
      } catch(e) { setIsReady(true); }
    } else {
      setIsReady(true);
    }
  },[]);

  useEffect(()=>{document.documentElement.setAttribute('data-theme',data.theme||'light');},[data.theme]);
  const handleOnboard=(fields)=>{
    const now = new Date();
    const mKey = `${now.getFullYear()}-${now.getMonth()}`;
    const t = T[fields.lang||'ru'];
    let nextData = {...fields, salaryConfirmedMonth: mKey, salaryConfirmedAt: now.toISOString(), activityLog: [], savingsHistory: []};
    
    // 1. If user has initial savings, record it
    if (fields.savingsBalance > 0) {
      nextData.savingsHistory.push({
        id: Date.now() - 1,
        date: now.toISOString(),
        type: 'deposit',
        amount: fields.savingsBalance,
        note: t.initialSavings || 'Начальный баланс'
      });
      nextData.activityLog.push({
        id: Date.now() - 2,
        date: now.toISOString(),
        type: 'income',
        label: t.initialSavings || 'Начальный баланс в копилке',
        amount: fields.savingsBalance,
        color: '#2d7d46'
      });
    }

    // 2. If user set up auto-savings, perform the first transfer immediately
    if (fields.monthlySavings > 0) {
      nextData.savingsBalance = (nextData.savingsBalance || 0) + fields.monthlySavings;
      nextData.savingsHistory.push({
        id: Date.now(),
        date: now.toISOString(),
        type: 'deposit',
        amount: fields.monthlySavings,
        note: t.autoSavingsLog
      });
      nextData.activityLog.push({
        id: Date.now() + 1,
        date: now.toISOString(),
        type: 'expense',
        label: t.autoSavingsLog,
        amount: fields.monthlySavings,
        color: '#c0392b'
      });
    }
    
    setData(nextData);
    save('onboarded',true);
    setOnboarded(true);
  };
  const t=T[data.lang||'ru'];
  const NAV=[
    {id:'home',label:t.home},
    {id:'budget',label:t.budget},
    {id:'debts',label:t.debts},
    {id:'savings',label:t.savings},
    {id:'history',label:t.history},
    {id:'settings',label:t.settings},
  ];
  if(!isReady) return <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text2)',fontSize:14}}>{t.loading}</div>;
  return(<>
    {!onboarded&&<Onboarding onDone={handleOnboard}/>}
    {tab==='home'&&<Dashboard data={data} setData={setData}/>}
    {tab==='budget'&&<BudgetPage data={data} setData={setData}/>}
    {tab==='debts'&&<DebtsPage data={data} setData={setData}/>}
    {tab==='savings'&&<SavingsPage data={data} setData={setData}/>}
    {tab==='history'&&<HistoryPage data={data} setData={setData}/>}
    {tab==='settings'&&<SettingsPage data={data} setData={setData}/>}
    <nav className="bottom-nav">
      {NAV.map(n=><button key={n.id} className={`nav-btn${tab===n.id?' active':''}`} onClick={()=>{haptic('light');setTab(n.id);}}>{NAV_ICONS[n.id]||NAV_ICONS.home}<span>{n.label}</span></button>)}
    </nav>
  </>);
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

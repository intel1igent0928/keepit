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
const monthKey = () => { const d=new Date(); return `${d.getFullYear()}-${d.getMonth()}`; };
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
       available:'Доступно', spent:'Потрачено', saved:'Накоплено', contracts:'Контракты',
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
       auto:'Авто', lunchTransport:'Обед и транспорт', lastMonthResult:'Итог прошлого периода',
       tgDesc3:'• Подтверждаете получение зарплаты\n• Добавляете крупный расход\n• Закрываете долг\n• Достигаете цели накопления',
       from:'из'
      },
  en:{ home:'Home', budget:'Budget', savings:'Savings', events:'Events', settings:'Settings',
       salary:'Salary', payday:'Pay Day', autoExpenses:'Auto Expenses', subscriptions:'Subscriptions',
       available:'Available', spent:'Spent', saved:'Saved', contracts:'Contracts',
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
       auto:'Auto', lunchTransport:'Lunch & Transport', lastMonthResult:'Last period result',
       tgDesc3:'• Confirm salary receipt\n• Add a large expense\n• Close a debt\n• Reach a savings goal',
       from:'from'
  },
};

const DEFAULT_DATA = {
  salary:4000000, currency:'UZS', salaryDay:25,
  salaryConfirmedMonth:null, salaryLastAsked:null,
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
  lastMonthResult:null,
  salaryConfirmedAt:null
};

const BACKEND_URL = 'http://localhost:8000';

const sendBotMsg=(text,endpoint='/notify')=>{
  const tgUserId=window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  if(!tgUserId||!BACKEND_URL) return; 
  fetch(BACKEND_URL+endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({tg_user_id:tgUserId,text}),
  }).catch(()=>{}); 
};

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
  const fe=data.fixedExpenses||[], cats=data.categories||[], be=data.bigExpenses||[];
  const ie=data.incomeEntries||[];

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

  const confAt = data.salaryConfirmedAt ? new Date(data.salaryConfirmedAt) : null;
  const confDay = confAt ? confAt.getDate() : 0;
  const confMonth = confAt ? confAt.getMonth() : -1;
  const confYear = confAt ? confAt.getFullYear() : -1;

  const bigSpent=be.filter(x=>{
    const bd=new Date(x.date);
    if(confAt && bd < confAt) return false;
    return bd.getMonth()===m&&bd.getFullYear()===y&&!x.fromSavings;
  }).reduce((s,x)=>s+x.amount,0);

  const extraIncome=ie.filter(x=>{
    const id=new Date(x.date);
    if(confAt && id < confAt) return false;
    return id.getMonth()===m&&id.getFullYear()===y;
  }).reduce((s,x)=>s+x.amount,0);

  const fixedPaid = fe.filter(x => {
    if (x.day > d) return false;
    // If salary was confirmed this month, ignore subscriptions that happened before confirmation
    if (confAt && confMonth === m && confYear === y && x.day < confDay) return false;
    return true;
  }).reduce((s,x)=>s+x.amount,0);

  const baseSalary=data.userType==='student'?(data.pocketMoney||0):data.salary;
  const totalIncome=baseSalary+extraIncome;
  const totalSpent=fixedPaid+catSpent+bigSpent;
  const balance=totalIncome-totalSpent;
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
  return {totalSpent,balance,grossBalance,daysLeft:adjustedDaysLeft,totalPeriod,dailyBudget,catSpent,bigSpent,fixedPaid,total,elapsed:d,catMonthly,fixedMonthly,extraIncome,totalIncome,baseSalary,wdElapsed,wdTotal,wdLeft,workdayBudget,monthlySav:data.monthlySavings||0};
}
const logActivity=(data,entry)=>({...data,activityLog:[...(data.activityLog||[]),{...entry,id:Date.now(),date:new Date().toISOString()}]});

function FlyChip({text,onDone}){ return <div className="fly-chip" onAnimationEnd={onDone}>{text}</div>; }

function FormattedInput({value, onChange, placeholder, style, className, lang='ru'}) {
  const valStr = (value===0||value) ? new Intl.NumberFormat(lang==='en'?'en-US':'ru-RU').format(value) : '';
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\s/g, '').replace(/,/g, '');
    if(!isNaN(raw)) onChange(raw);
  };
  return <input className={className} style={style} type="text" inputMode="numeric" value={valStr} onChange={handleChange} placeholder={placeholder}/>;
}

function NumPadSheet({title, onConfirm, onClose, currency, showName=false, lang='ru'}){
  const [val,setVal]=useState('0');
  const [note,setNote]=useState('');
  const t=T[lang];
  const press=(n)=>{
    haptic('light');
    if(n==='C') setVal('0');
    else if(n==='.') { if(!val.includes('.')) setVal(v=>v+n); }
    else setVal(v=>v==='0'?n:v+n);
  };
  return(
    <div className="sheet-overlay fade-in" onClick={onClose}>
      <div className="sheet-card slide-up" onClick={e=>e.stopPropagation()}>
        <div className="sheet-hdr"><h3>{title}</h3><button onClick={onClose}>✕</button></div>
        <div className="sheet-val">{new Intl.NumberFormat(lang==='en'?'en-US':'ru-RU').format(parseFloat(val)||0)} <span style={{fontSize:16,color:'var(--text3)'}}>{currency}</span></div>
        {showName&&<input className="glass-input" placeholder={t.bigExpenseTitle} value={note} onChange={e=>setNote(e.target.value)} style={{marginBottom:15}}/>}
        <div className="numpad">
          {[1,2,3,4,5,6,7,8,9,'.',0,'C'].map(n=><button key={n} onClick={()=>press(n.toString())}>{n}</button>)}
        </div>
        <button className="btn-primary" style={{marginTop:15}} onClick={()=>{onConfirm(parseFloat(val),{name:note});onClose();}}>{t.confirm}</button>
      </div>
    </div>
  );
}

function Onboarding({onDone}){
  const [step,setStep]=useState(0);
  const [userType,setUserType]=useState(null); 
  const [d,setD]=useState({salary:4000000,salaryDay:25,dailyAmount:50000,pocketMoney:500000,pocketDays:7,savings:0,monthlySavings:1000000,currency:'UZS',lang:'ru',theme:'light'});
  const t=T[d.lang];
  const update=(f)=>setD(p=>({...p,...f}));

  if(!userType) return (
    <div className="ob-overlay">
      <div className="ob-card pop-in">
        <span className="ob-emoji">👋</span>
        <h2>{t.helloTitle}</h2><p>{t.helloSub}</p>
        <button className="btn-primary" onClick={()=>{haptic('medium');setUserType('worker');update({userType:'worker'});}}>{t.workerBtn}</button>
        <button className="btn-primary" onClick={()=>{haptic('medium');setUserType('student');update({userType:'student'});}} style={{background:'var(--surface2)',color:'var(--text1)',marginTop:10}}>{t.studentBtn}</button>
        <div style={{marginTop:20,display:'flex',gap:10,justifyContent:'center'}}>
          {Object.entries(LANGS).map(([c,n])=><button key={c} className={`btn-sm ${d.lang===c?'active':''}`} onClick={()=>update({lang:c})}>{c==='ru'?'🇷🇺':'🇬🇧'}</button>)}
        </div>
      </div>
    </div>
  );

  const workerSteps=[
    {emoji:'💰',title:t.yourSalary,sub:t.yourSalarySub,content:(
      <div style={{width:'100%'}}>
        <FormattedInput className="glass-input" value={d.salary} onChange={v=>update({salary:v})} placeholder={t.yourSalary} lang={d.lang}/>
        <input className="glass-input" type="number" value={d.salaryDay} onChange={e=>update({salaryDay:e.target.value})} placeholder={t.salaryDayPlace} style={{marginTop:10}}/>
      </div>
    )},
    {emoji:'🍱',title:t.dailyBudget,sub:t.dailyBudgetSub,content:(
      <div style={{width:'100%'}}>
        <FormattedInput className="glass-input" value={d.dailyAmount} onChange={v=>update({dailyAmount:v})} placeholder={t.perDay} lang={d.lang}/>
        <p style={{fontSize:11,color:'var(--text3)',marginTop:8}}>{t.dailyBudgetHint}</p>
      </div>
    )},
    {emoji:'💹',title:t.saveAuto,sub:t.saveAutoSub,content:(
      <div style={{width:'100%'}}>
        <FormattedInput className="glass-input" value={d.monthlySavings} onChange={v=>update({monthlySavings:v})} placeholder={t.monthlyDeposit} lang={d.lang}/>
      </div>
    )},
    {emoji:'🏦',title:t.saveTarget,sub:t.saveTargetSub,content:(
      <div style={{width:'100%'}}>
        <FormattedInput className="glass-input" value={d.savings} onChange={v=>update({savings:v})} placeholder={t.savingsBalance} lang={d.lang}/>
      </div>
    )},
  ];
  const studentSteps=[
    {emoji:'💸',title:t.pocketMoney,sub:t.pocketMoneySub,content:(
      <div style={{width:'100%'}}>
        <FormattedInput className="glass-input" value={d.pocketMoney} onChange={v=>update({pocketMoney:v})} placeholder={t.pocketMoney} lang={d.lang}/>
        <input className="glass-input" type="number" value={d.pocketDays} onChange={e=>update({pocketDays:e.target.value})} placeholder={t.pocketDays} style={{marginTop:10}}/>
      </div>
    )},
    {emoji:'🍱',title:t.dailyBudget,sub:t.studentDailySub,content:(
      <div style={{width:'100%'}}>
        <FormattedInput className="glass-input" value={d.dailyAmount} onChange={v=>update({dailyAmount:v})} placeholder={t.perDay} lang={d.lang}/>
      </div>
    )},
    {emoji:'🏦',title:t.saveTarget,sub:t.saveTargetSub,content:(
      <div style={{width:'100%'}}>
        <FormattedInput className="glass-input" value={d.savings} onChange={v=>update({savings:v})} placeholder={t.savingsBalance} lang={d.lang}/>
      </div>
    )},
  ];
  const steps=userType==='student'?studentSteps:workerSteps;
  const cur=steps[step];
  const finish=()=>{
    haptic('heavy');
    const daily=parseFloat(d.dailyAmount)||0;
    const defaultCats=daily>0?[{id:'lunch',name:t.lunchTransport,icon:'🍱',monthlyLimit:daily*22,dailyAmount:daily,deductType:'daily',type:'workday',color:'#d97706'}]:[];
    if(userType==='worker'){
      onDone({userType:'worker',lang:d.lang||'ru',theme:d.theme||'light',salary:parseFloat(d.salary)||4000000,currency:d.currency,salaryDay:parseInt(d.salaryDay)||25,monthlySavings:parseFloat(d.monthlySavings)||0,savingsBalance:parseFloat(d.savings)||0,categories:defaultCats});
    } else {
      onDone({userType:'student',lang:d.lang||'ru',theme:d.theme||'light',pocketMoney:parseFloat(d.pocketMoney)||0,pocketDays:parseInt(d.pocketDays)||7,pocketStartDate:new Date().toISOString(),salary:0,currency:d.currency,salaryDay:0,monthlySavings:0,savingsBalance:parseFloat(d.savings)||0,categories:defaultCats});
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
  const {balance,grossBalance,monthlySav,daysLeft,totalPeriod,dailyBudget,catSpent,elapsed,total,catMonthly,fixedMonthly,fixedPaid,extraIncome,totalIncome,baseSalary,wdElapsed,wdTotal,wdLeft,workdayBudget}=calcBalance(data);
  const now=todayDate();
  
  const closestEvents = [...(data.events||[])].filter(e=>new Date(e.date)>=new Date(now.toDateString())).sort((a,b)=>new Date(a.date)-new Date(b.date)).slice(0,3);
  const [showEvForm,setShowEvForm]=useState(false);
  const [evForm,setEvForm]=useState({name:'',date:'',budget:''});
  const addEv=()=>{if(!evForm.name||!evForm.date)return;haptic('medium');setData(d=>({...d,events:[...(d.events||[]),{id:Date.now(),name:evForm.name,date:evForm.date,budget:parseFloat(evForm.budget)||0}]}));setShowEvForm(false);setEvForm({name:'',date:'',budget:''});};
  const progress=Math.max(0,Math.min(100,grossBalance/Math.max(1,totalIncome)*100));
  const h=now.getHours();
  const greeting=h<12?t.morning:h<17?t.afternoon:t.evening;
  const userName=tg?.initDataUnsafe?.user?.first_name||'';
  const todayStr=now.toDateString();
  const showSalary=data.userType!=='student'&&data.salaryDay>0&&now.getDate()>=data.salaryDay&&data.salaryConfirmedMonth!==monthKey()&&data.salaryLastAsked!==todayStr;
  
  const confirmSalary=()=>{
    haptic('heavy');notify('success');
    const stats = calcBalance(data);
    setData(d=>{
      const next={
        ...d,
        salaryConfirmedMonth:monthKey(),
        salaryConfirmedAt:new Date().toISOString(),
        salaryLastAsked:null,
        lastMonthResult:stats.balance,
        lastMonthSpent:stats.totalSpent
      };
      // Auto-savings removed per user request: "let it not be added... user will add manually"
      notifySalary(d.salary, 0, d.currency, d.lang); 
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
      if(extras.fromSavings){next.savingsBalance=Math.max(0,(d.savingsBalance||0)-amount);next.savingsHistory=[...(d.savingsHistory||[]),{id:Date.now(),date:now.toISOString(),type:'withdraw',amount,note:extras.name||t.largeExpenseDefault}];}
      notifyBigExpense(extras.name||t.largeExpenseDefault,amount,d.currency,d.lang);
      return logActivity(next,{type:'expense',label:extras.name||t.largeExpenseDefault,amount,color:'#c0392b'});
    });
    setChip(`-${fmtShort(amount, data.currency, data.lang)}`);setSheet(null);setTimeout(()=>setChip(null),700);
  };
  const addIncome=(amount,extras)=>{
    haptic('medium');notify('success');
    const entry={id:Date.now(),amount,note:extras?.name||t.extraIncomeDefault,date:now.toISOString()};
    setData(d=>{
      const next={...d,incomeEntries:[...(d.incomeEntries||[]),entry]};
      if(d.userType==='student') next.pocketMoney=(d.pocketMoney||0)+amount;
      return logActivity(next,{type:'income',label:entry.note,amount,color:'#2d7d46'});
    });
    setChip(`+${fmtShort(amount, data.currency, data.lang)}`);setIncomeSheet(false);setTimeout(()=>setChip(null),700);
  };
  return(
    <div className="page" style={{paddingBottom:80}}>
      {chip&&<FlyChip text={chip} onDone={()=>setChip(null)}/>}
      <div className="dashboard-hdr fade-up">
        <div className="greeting">{greeting}, {userName}!</div>
        <div className="main-balance">{fmt(balance, data.currency, data.lang)}</div>
        <div className="sub-balance">{t.available} {t.today}</div>
      </div>

      <div className="card fade-up d1" style={{marginBottom:14}}>
        <div className="pbar-hdr"><span>{t.available}</span><span style={{fontWeight:800}}>{fmtShort(balance, data.currency, data.lang)} / {fmtShort(totalIncome, data.currency, data.lang)}</span></div>
        <div className="pbar-wrap"><div className="pbar-fill" style={{width:progress+'%'}}/></div>
        <div className="pbar-labels"><span>{daysLeft} {t.daysLeft}</span><span>{Math.round(100-progress)}% {t.spentLower}</span></div>
      </div>

      {data.lastMonthResult !== undefined && data.lastMonthResult !== null && (
        <div className="card fade-up d1" style={{padding:'8px 12px', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.05)', fontSize:12, border:'1px solid var(--border)'}}>
          <div style={{color:'var(--text2)'}}>📋 {t.lastMonthResult}</div>
          <div style={{fontWeight:700, color:data.lastMonthResult>=0?'var(--green)':'var(--coral)'}}>
            {data.lastMonthResult>=0?'+':''}{fmt(data.lastMonthResult, data.currency, data.lang)}
          </div>
        </div>
      )}

      {data.userType==='worker' && workdayBudget>0 && (
        <div className="card fade-up d1" style={{padding:12, marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--surface2)', border:'1px dashed var(--border)'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
             <div style={{fontSize:24}}>🍱</div>
             <div>
               <div style={{fontSize:13, fontWeight:700}}>{t.lunchTransport}</div>
               <div style={{fontSize:11, color:'var(--text2)'}}>{wdElapsed} / {wdTotal} {t.workDays}</div>
             </div>
          </div>
          <div style={{textAlign:'right'}}>
             <div style={{fontSize:14, fontWeight:900, color:'var(--accent)'}}>{fmtShort(workdayBudget, data.currency, data.lang)} {t.perDay}</div>
             <div style={{fontSize:10, color:'var(--text3)'}}>{t.auto}</div>
          </div>
        </div>
      )}

      {showSalary && (
        <div className="salary-ask card pop-in">
          <h3>💰 {t.received}</h3>
          <p>{fmt(data.salary, data.currency, data.lang)}</p>
          <div style={{display:'flex',gap:10,marginTop:15}}>
            <button className="btn-primary" style={{margin:0,flex:2}} onClick={confirmSalary}>{t.salaryConfirmed}</button>
            <button className="btn-ghost" style={{margin:0,flex:1}} onClick={dismissSalaryTomorrow}>{t.salaryNotYet}</button>
          </div>
        </div>
      )}

      <div className="stats-grid fade-up d2">
        <div className="card stat-card" onClick={()=>{haptic('light');setSheet('expense');}}>
          <div className="stat-label">{t.youCanSpend}</div>
          <div className="stat-val" style={{color:'var(--accent)'}}>{fmtShort(dailyBudget, data.currency, data.lang)}</div>
        </div>
        <div className="card stat-card" onClick={()=>{haptic('light');setIncomeSheet(true);}}>
          <div className="stat-label">{data.userType==='student'?t.studentExtraBtn:t.extraIncomeBtn}</div>
          <div className="stat-val" style={{color:'var(--green)'}}>+{fmtShort(extraIncome, data.currency, data.lang)}</div>
        </div>
      </div>

      <div className="sec-title fade-up d2">{t.nearestEvents}</div>
      <div className="events-mini fade-up d3">
        {closestEvents.length===0?(<button className="card ev-mini-card empty" onClick={()=>setShowEvForm(true)}><span>+</span> {t.addEvent}</button>):(
          <>
            {closestEvents.map(ev=>(<div className="card ev-mini-card" key={ev.id}>
              <div className="ev-m-date">{new Date(ev.date).getDate()}</div>
              <div className="ev-m-name">{ev.name}</div>
            </div>))}
            <button className="ev-mini-more" onClick={()=>setShowEvForm(true)}>+</button>
          </>
        )}
      </div>

      <div className="sec-title fade-up d3">{t.largeExpenses}</div>
      <div style={{padding:'0 20px'}}>
        {thisMonthBig.length===0?(<div className="card empty-state fade-up d4">{t.noLargeExpenses}</div>):(
          thisMonthBig.map(be=>(
            <div className="history-item fade-up" key={be.id}>
              <div className="hi-dot" style={{background:be.fromSavings?'var(--blue)':'var(--coral)'}}/>
              <div className="hi-info"><div className="hi-name">{be.name}</div><div className="hi-sub">{be.fromSavings?t.fromSavings:fmtDate(be.date, data.lang)}</div></div>
              <div className="hi-amount">-{fmtShort(be.amount, data.currency, data.lang)}</div>
            </div>
          ))
        )}
        <button className="add-btn fade-up d4" onClick={()=>{haptic('light');setSheet('expense');}}>{t.addBigExpense}</button>
      </div>

      {sheet==='expense' && <NumPadSheet title={t.addBigExpense} currency={data.currency} onClose={()=>setSheet(null)} onConfirm={addBig} showName lang={data.lang}/>}
      {incomeSheet && <NumPadSheet title={data.userType==='student'?t.studentExtraBtn:t.extraIncomeBtn} currency={data.currency} onClose={()=>setIncomeSheet(false)} onConfirm={addIncome} showName lang={data.lang}/>}
      {showEvForm && (
        <div className="sheet-overlay fade-in" onClick={()=>setShowEvForm(false)}>
          <div className="sheet-card slide-up" onClick={e=>e.stopPropagation()}>
            <div className="sheet-hdr"><h3>{t.addEvent}</h3><button onClick={()=>setShowEvForm(false)}>✕</button></div>
            <input className="glass-input" placeholder={t.eventName} value={evForm.name} onChange={e=>setEvForm(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
            <input className="glass-input" type="date" value={evForm.date} onChange={e=>setEvForm(p=>({...p,date:e.target.value}))} style={{marginBottom:10,colorScheme:'light'}}/>
            <FormattedInput placeholder={t.eventBudget} value={evForm.budget} onChange={v=>setEvForm(p=>({...p,budget:v}))} style={{marginBottom:15}} lang={data.lang}/>
            <button className="btn-primary" onClick={addEv}>{t.confirm}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function BudgetPage({data,setData}){
  const t=T[data.lang||'ru'];
  const [showSub,setShowSub]=useState(false);
  const [subForm,setSubForm]=useState({name:'',amount:'',day:1,icon:'⚡'});
  const {catMonthly,fixedMonthly,fixedPaid,elapsed,total}=calcBalance(data);

  const addSub=()=>{if(!subForm.name||!subForm.amount)return;haptic('medium');setData(d=>({...d,fixedExpenses:[...(d.fixedExpenses||[]),{...subForm,id:Date.now(),amount:parseFloat(subForm.amount)}]}));setShowSub(false);setSubForm({name:'',amount:'',day:1,icon:'⚡'});};
  return(
    <div className="page" style={{paddingBottom:80}}>
      <div className="page-hdr fade-up"><h1>📊 {t.budget}</h1></div>
      <div className="stats-grid fade-up d1">
        <div className="card stat-card"><div className="stat-label">{t.spent}</div><div className="stat-val" style={{color:'var(--coral)'}}>-{fmtShort(catMonthly+fixedMonthly, data.currency, data.lang)}</div><div className="stat-meta">{t.perMonth}</div></div>
        <div className="card stat-card"><div className="stat-label">{t.available}</div><div className="stat-val" style={{color:'var(--green)'}}>{fmtShort(data.salary-catMonthly-fixedMonthly-data.monthlySavings, data.currency, data.lang)}</div><div className="stat-meta">{t.done}</div></div>
      </div>
      <div className="sec-title fade-up d2">{t.subscriptions}</div>
      <div style={{padding:'0 20px'}}>
        {(data.fixedExpenses||[]).map((s,i)=>(
          <div className="history-item fade-up" key={s.id} style={{animationDelay:i*0.05+'s'}}>
            <div className="hi-dot" style={{background:s.day<=elapsed?'var(--green)':'var(--text3)'}}/>
            <div className="hi-info"><div className="hi-name">{s.icon} {s.name}</div><div className="hi-sub">{s.day} {t.billingDay.split('(')[0]}</div></div>
            <div style={{textAlign:'right'}}>
              <div className="hi-amount">-{fmtShort(s.amount, data.currency, data.lang)}</div>
              <button style={{fontSize:10,color:'var(--coral)',background:'none',border:'none',marginTop:2}} onClick={()=>{haptic('medium');setData(d=>({...d,fixedExpenses:d.fixedExpenses.filter(x=>x.id!==s.id)}));}}>{t.delete}</button>
            </div>
          </div>
        ))}
        {showSub?(<div className="card fade-up" style={{padding:16,marginTop:10}}>
          <div className="icon-row">{ICONS.slice(0,8).map(ic=><span key={ic} className={`icon-opt${subForm.icon===ic?' selected':''}`} onClick={()=>setSubForm(p=>({...p,icon:ic}))}>{ic}</span>)}</div>
          <input className="glass-input" placeholder={t.bigExpenseTitle} value={subForm.name} onChange={e=>setSubForm(p=>({...p,name:e.target.value}))} style={{marginBottom:10}}/>
          <FormattedInput placeholder={t.debtAmount} value={subForm.amount} onChange={v=>setSubForm(p=>({...p,amount:v}))} style={{marginBottom:10}} lang={data.lang}/>
          <input className="glass-input" type="number" min="1" max="31" placeholder={t.billingDay} value={subForm.day} onChange={e=>setSubForm(p=>({...p,day:parseInt(e.target.value)}))} style={{marginBottom:12}}/>
          <button className="btn-primary" onClick={addSub}>{t.save}</button>
          <button className="btn-ghost" onClick={()=>setShowSub(false)}>{t.cancel}</button>
        </div>):(<button className="add-btn fade-up d3" onClick={()=>{haptic('light');setShowSub(true);}}>{t.addSubscription}</button>)}
      </div>
    </div>
  );
}

function SavingsPage({data,setData}){
  const t=T[data.lang||'ru'];
  const [addSheet,setAddSheet]=useState(false);
  const [wdSheet,setWdSheet]=useState(false);
  const [showAdd,setShowAdd]=useState(false);
  const [gForm,setGForm]=useState({name:'',target:'',monthly:''});
  const [selIcon,setSelIcon]=useState('🏠');
  const goalIcons=['🏠','🚗','📱','💻','✈️','💍','🎓','🏝️'];

  const deposit=(amt,extras)=>{haptic('medium');setData(d=>({...d,savingsBalance:(d.savingsBalance||0)+amt,savingsHistory:[...(d.savingsHistory||[]),{id:Date.now(),date:new Date().toISOString(),type:'deposit',amount:amt,note:extras.name||t.deposit}]}));};
  const withdraw=(amt,extras)=>{haptic('medium');setData(d=>({...d,savingsBalance:Math.max(0,(d.savingsBalance||0)-amt),savingsHistory:[...(d.savingsHistory||[]),{id:Date.now(),date:new Date().toISOString(),type:'withdraw',amount:amt,note:extras.name||t.withdraw}]}));};
  const saveGoal=()=>{if(!gForm.name||!gForm.target)return;haptic('medium');setData(d=>({...d,savingsGoals:[...(d.savingsGoals||[]),{id:Date.now(),name:gForm.name,target:parseFloat(gForm.target),monthly:parseFloat(gForm.monthly)||0,icon:selIcon,saved:0}]}));setShowAdd(false);setGForm({name:'',target:'',monthly:''});};

  return(
    <div className="page" style={{paddingBottom:80}}>
      <div className="page-hdr fade-up"><h1>🏦 {t.savings}</h1></div>
      <div className="sav-hero fade-up d1">
        <div className="sav-total">{fmt(data.savingsBalance, data.currency, data.lang)}</div>
        <div className="sav-label">{t.savingsBalance}</div>
        <div className="sav-actions">
          <button className="btn-sav" onClick={()=>{haptic('light');setAddSheet(true);}}><span className="icon">📥</span>{t.deposit}</button>
          <button className="btn-sav" onClick={()=>{haptic('light');setWdSheet(true);}}><span className="icon">📤</span>{t.withdraw}</button>
        </div>
      </div>
      {data.savingsHistory?.length>0 && <>
        <div className="sec-title fade-up d2">{t.history}</div>
        <div className="sav-history-list fade-up d2">
          {[...(data.savingsHistory||[])].reverse().slice(0,20).map(h=>(
            <div className="sav-history-item" key={h.id}>
              <div className="shi-icon">{h.type==='deposit'?'📥':'📤'}</div>
              <div className="shi-info"><div className="shi-note">{h.note}</div><div className="shi-date">{fmtDate(h.date, data.lang)}</div></div>
              <div className={`shi-amount ${h.type==='deposit'?'in':'out'}`}>{h.type==='deposit'?'+':'-'}{fmtShort(h.amount,data.currency,data.lang)}</div>
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
              <div><div className="sav-goal-name">{g.icon} {g.name}</div><div className="sav-goal-sub">{fmtShort(g.saved,data.currency,data.lang)} {t.from} {fmtShort(g.target,data.currency,data.lang)}{g.monthly>0&&` · ${fmtShort(g.monthly, data.currency, data.lang)}/${t.mo}`}</div></div>
              <div style={{fontSize:20,fontWeight:900,color:'var(--blue)'}}>{pct}%</div>
            </div>
            <div className="pbar-wrap"><div className="pbar-fill" style={{width:pct+'%',background:'linear-gradient(90deg,var(--blue),var(--purple))'}}/></div>
            <div style={{display:'flex',gap:8,marginTop:10}}>
              <button className="btn-sm" style={{background:'var(--green-soft)',color:'var(--green)',flex:1}} onClick={()=>{haptic('light');const amt=parseFloat(prompt(t.howMuchToSave));if(amt>0)setData(d=>({...d,savingsBalance:Math.max(0,(d.savingsBalance||0)-amt),savingsGoals:(d.savingsGoals||[]).map(x=>x.id===g.id?{...x,saved:x.saved+amt}:x),savingsHistory:[...(d.savingsHistory||[]),{id:Date.now(),date:new Date().toISOString(),type:'deposit',amount:amt,note:'→ '+g.name}]}));}}>{t.saveGoalBtn}</button>
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
                <div className="debt-amount owe">-{fmtShort(d.amount-(d.paidAmount||0),data.currency, data.lang)}</div>
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
                <div className="debt-amount owed">+{fmtShort(d.amount-(d.paidAmount||0),data.currency, data.lang)}</div>
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
              <div className="debt-amount" style={{color:'var(--text3)'}}>{fmtShort(d.amount,data.currency, data.lang)}</div>
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

  const items=[];
  const isCurrentMonth = m === now.getMonth() && y === now.getFullYear();
  const isPastMonth = y < now.getFullYear() || (y === now.getFullYear() && m < now.getMonth());
  const vTotal = daysInMonth(y,m);
  const vElapsed = isPastMonth ? vTotal : (isCurrentMonth ? now.getDate() : 0);
  const vWdElapsed = isPastMonth ? workdaysInMonth(y,m) : (isCurrentMonth ? countWorkdays(y,m,1,now.getDate()) : 0);
  const vWdTotal = workdaysInMonth(y,m);

  if (data.userType !== 'student' && data.salary > 0 && vElapsed >= data.salaryDay) {
    items.push({id:'v_salary',icon:'💰',name:t.salaryLog,sub:t.auto,amount:data.salary,color:'#2d7d46',date:new Date(y,m,data.salaryDay,9,0).toISOString()});
  }

  (data.categories||[]).forEach(c=>{
    let s = 0;
    if (c.deductType === 'upfront') s = c.monthlyLimit || ((c.dailyAmount||0)*vWdTotal);
    else {
      if (c.type === 'workday') s = (c.dailyAmount||0)*vWdElapsed;
      else s = (c.monthlyLimit/vTotal)*vElapsed;
    }
    if(s>0) items.push({id:'cat_'+c.id,icon:c.icon,name:c.name,sub:c.deductType==='upfront'?t.immediatelyMonth:t.autoExpenseAccum,amount:-s,color:'#c0392b',date:new Date(y,m,Math.max(1,vElapsed)).toISOString()});
  });
  (data.fixedExpenses||[]).filter(fe=>fe.day<=vElapsed).forEach(fe=>{
    items.push({id:'fe_'+fe.id,icon:fe.icon,name:fe.name,sub:`${t.subscription} · ${fe.day}-го`,amount:-fe.amount,color:'#c0392b',date:new Date(y,m,fe.day,10,0).toISOString()});
  });
  (data.bigExpenses||[]).filter(be=>{const bd=new Date(be.date);return bd.getMonth()===m&&bd.getFullYear()===y;}).forEach(be=>{
    items.push({id:'be_'+be.id,icon:be.icon,name:be.name,sub:be.fromSavings?t.fromSavings:t.expenses.substring(0,t.expenses.length-1),amount:-be.amount,color:be.fromSavings?'#2563eb':'#c0392b',date:be.date});
  });
  (data.activityLog||[]).filter(a=>{const ad=new Date(a.date);return ad.getMonth()===m&&ad.getFullYear()===y;}).forEach(a=>{
    const isInc = a.type === 'income' || (a.type === 'debt_paid' && (a.label.includes(t.debtReturnedLog) || a.label.includes(t.debtReceivedLog)));
    items.push({id:'act_'+a.id,icon:'📋',name:a.label,sub:t.historyOp,amount:a.amount ? (isInc ? a.amount : -a.amount) : 0,color:a.color||'#6e6a65',date:a.date});
  });

  items.sort((a,b)=>new Date(b.date)-new Date(a.date));
  const filteredItems = items.filter(i => {
    if(filter==='income') return i.amount > 0;
    if(filter==='expense') return i.amount < 0;
    return true;
  });

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
    <div className="page" style={{paddingBottom:80}}>
      <div className="page-hdr fade-up" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div><h1>📊 {t.history}</h1><p>{viewDate.toLocaleString(data.lang==='en'?'en-US':'ru-RU',{month:'long',year:'numeric'})}</p></div>
        <div style={{display:'flex',gap:4}}>
          <button className="btn-ghost" style={{padding:'6px 12px',margin:0,minWidth:'auto'}} onClick={()=>{haptic('light');setViewDate(new Date(y,m-1,1))}}>⬅️</button>
          <button className="btn-ghost" style={{padding:'6px 12px',margin:0,minWidth:'auto'}} onClick={()=>{haptic('light');setViewDate(new Date(y,m+1,1))}}>➡️</button>
        </div>
      </div>
      <div style={{display:'flex',gap:8,padding:'0 20px',marginBottom:16}}>
        {[['all',t.all],['expense',t.expenses],['income',t.income]].map(([val,label])=>(
          <button key={val} className={`btn-sm ${filter===val?'active':''}`} style={{flex:1, padding:'8px 0', background:filter===val?'var(--accent-soft)':'var(--surface2)', color:filter===val?'var(--accent)':'var(--text2)', borderColor:filter===val?'var(--accent)':'var(--border)'}} onClick={()=>{haptic('light');setFilter(val);}}>{label}</button>
        ))}
      </div>
      <div style={{padding:'0 20px',marginBottom:16}}>
        <button className="btn-ghost" style={{width:'100%',color:'var(--blue)',borderColor:'rgba(37,99,235,0.3)',marginBottom:16}} onClick={downloadCSV}>{t.downloadCSV}</button>
        {Object.entries(grouped).map(([dateLabel, dayItems]) => (
          <div key={dateLabel} style={{marginBottom: 16}}>
            <div style={{fontSize: 13, color: 'var(--text2)', marginBottom: 8, fontWeight: 700}}>{dateLabel}</div>
            {dayItems.map((item,i)=>(
              <div className="history-item fade-up" key={item.id} style={{animationDelay:i*0.02+'s'}}>
                <div className="hi-dot" style={{background:item.color}}/>
                <div className="hi-info"><div className="hi-name">{item.icon} {item.name}</div><div className="hi-sub">{item.sub}</div></div>
                <div className="hi-amount" style={{color:item.amount>=0?'var(--green)':'var(--coral)'}}>{item.amount>=0?'+':''}{fmtShort(Math.abs(item.amount), data.currency, data.lang)}</div>
              </div>
            ))}
          </div>
        ))}
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
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_name: uname, user_id: uid, text: feedbackText})
      });
    } catch(e) {}
    alert(t.feedbackSuccess);
    setFeedbackText('');
  };
  const resetAll=()=>{if(!window.confirm(t.resetConfirm))return;haptic('heavy');localStorage.clear();window.location.reload();};
  return(
    <div className="page" style={{paddingBottom:80}}>
      <div className="page-hdr fade-up"><h1>⚙️ {t.settings}</h1></div>
      <div className="sec-title">{t.theme}</div>
      <div className="theme-toggle-row fade-up d1">
        {[['light','☀️',t.light],['dark','🌙',t.dark]].map(([val,icon,label])=>(
          <button key={val} className={`theme-opt${data.theme===val?' active':''}`} onClick={()=>{haptic('light');setData(d=>({...d,theme:val}));}}><span className="to-icon">{icon}</span><span className="to-label">{label}</span></button>
        ))}
      </div>
      <div className="sec-title">{t.language}</div>
      <div className="settings-group fade-up d2">
        {Object.entries(LANGS).map(([code,name])=>(
          <div className="settings-row" key={code} onClick={()=>{haptic('light');setData(d=>({...d,lang:code}));}} style={{cursor:'pointer'}}>
            <div className="sr-icon">{code==='ru'?'🇷🇺':'🇬🇧'}</div><div className="sr-label">{name}</div>{data.lang===code&&<div style={{color:'var(--blue)',fontWeight:900}}>✓</div>}
          </div>
        ))}
      </div>
      <div className="sec-title">{t.currency}</div>
      <div className="settings-group fade-up d2">
        <div className="settings-row"><div className="sr-icon">💱</div><div className="sr-label">{t.currency}</div>
          <select value={data.currency} onChange={e=>{haptic('light');setData(d=>({...d,currency:e.target.value}));}}>
            {CURRENCIES.map(c=><option key={c} style={{background:'var(--bg)'}}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="sec-title">{t.salary}</div>
      <div className="settings-group fade-up d3">
        <div className="settings-row"><div className="sr-icon">💰</div><div className="sr-label">{t.salary}</div>
          <FormattedInput value={data.salary} onChange={v=>setData(d=>({...d,salary:parseFloat(v)||0}))} style={{background:'none',border:'none',color:'var(--blue)',fontWeight:700,fontFamily:'inherit',fontSize:13,width:130,textAlign:'right',outline:'none'}} lang={data.lang}/>
        </div>
        <div className="settings-row"><div className="sr-icon">📅</div><div className="sr-label">{t.paydaySett}</div>
          <input type="number" min="1" max="31" value={data.salaryDay} onChange={e=>setData(d=>({...d,salaryDay:parseInt(e.target.value)||1}))} style={{background:'none',border:'none',color:'var(--blue)',fontWeight:700,fontFamily:'inherit',fontSize:13,width:50,textAlign:'right',outline:'none'}}/>
        </div>
      </div>
      <div className="sec-title fade-up d3">{t.feedback}</div>
      <div className="settings-group fade-up d3" style={{padding:16,display:'flex',flexDirection:'column'}}>
        <textarea className="glass-input" placeholder={t.feedbackPlaceholder} value={feedbackText} onChange={e=>setFeedbackText(e.target.value)} style={{minHeight:80,marginBottom:12,resize:'vertical',padding:12}}/>
        <button className="btn-primary" onClick={sendFeedback} style={{margin:0}}>{t.feedbackSubmit}</button>
      </div>
      <div className="sec-title fade-up d3">{t.tgNotifications}</div>
      <div className="settings-group fade-up d4">
        <div className="settings-row"><div className="sr-icon">🔔</div><div className="sr-label" style={{fontSize:13}}>{t.tgDesc1}</div><div style={{fontSize:11,color:'var(--green)',fontWeight:700}}>✓ {t.auto}</div></div>
        <div className="settings-row" style={{flexDirection:'column',alignItems:'flex-start',gap:6}}>
          <div style={{fontSize:12,color:'var(--text2)',lineHeight:1.6}}>{t.tgDesc2}</div>
          <div style={{fontSize:12,color:'var(--text3)',lineHeight:1.8}}>{t.tgDesc3.split('\n').map((line,i)=><div key={i}>{line}</div>)}</div>
        </div>
        <div className="settings-row"><button className="btn-sm" style={{width:'100%',background:'var(--accent-soft)',color:'var(--accent)',borderColor:'var(--accent)'}} onClick={()=>{haptic('medium');sendBotMsg(`🔔 KeepIt: ${t.tgTest.substring(2)} ✅`);}}>{t.tgTest}</button></div>
      </div>
      <div style={{padding:'0 20px',marginTop:8,paddingBottom:20}}>
        <button className="btn-ghost" style={{color:'var(--coral)',borderColor:'rgba(229,62,62,0.25)'}} onClick={resetAll}>🗑️ {t.reset}</button>
      </div>
    </div>
  );
}

const NAV_ICONS={
  home:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  budget:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1h-9a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9zm-9-2h10V8H12v8zm4-2.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>,
  debts:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
  savings:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.5 2C6.81 2 3 5.81 3 10.5S6.81 19 11.5 19h.5v3l4.81-2.81C19.21 17.79 21 15.54 21 13V5c0-1.66-1.34-3-3-3h-6.5zm-4.5 11c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>,
  history:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6a7 7 0 0 1 7-7 7 7 0 0 1 7 7 7 7 0 0 1-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>,
  settings:<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.61-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96a7 7 0 0 0-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54a7.12 7.12 0 0 0-1.61.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.6l2.03 1.58a7.2 7.2 0 0 0-.07.94c0 .32.02.64.07.94L2.86 14.5c-.18.14-.23.41-.12.6l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.36 1.04.67 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.12 7.12 0 0 0 1.61-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.6l-2.01-1.56zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/></svg>,
};

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
  const handleOnboard=(fields)=>{setData(d=>({...d,...fields}));save('onboarded',true);setOnboarded(true);};
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

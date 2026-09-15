// ─── Centralized translation dictionary ────────────────────────────────────
// Every user-visible string across the entire game lives here.
// Components call `useT()` to get the right language version.

export type Lang = "en" | "bm";

const T = {
  // ── StatsBar / HUD ──
  week:              { en: "WEEK", bm: "MINGGU" },
  day:               { en: "DAY", bm: "HARI" },
  cash:              { en: "Cash", bm: "Tunai" },
  debt:              { en: "Debt", bm: "Hutang" },
  creditScore:       { en: "Credit Score", bm: "Skor Kredit" },
  health:            { en: "Health", bm: "Kesihatan" },
  stress:            { en: "Stress", bm: "Tekanan" },
  poor:              { en: "POOR", bm: "TERUK" },
  fair:              { en: "FAIR", bm: "SEDERHANA" },
  good:              { en: "GOOD", bm: "BAIK" },
  excellent:         { en: "EXCELLENT", bm: "CEMERLANG" },
  criticalHealth:    { en: "CRITICAL HEALTH!", bm: "KESIHATAN KRITIKAL!" },
  burnoutWarning:    { en: "BURNOUT WARNING!", bm: "AMARAN BURNOUT!" },
  broke:             { en: "BROKE!", bm: "BANKRAP!" },

  // ── EnergyBar ──
  energyLabel:       { en: "⚡ Energy = Your Week", bm: "⚡ Tenaga = Minggu Anda" },
  work5days:         { en: "Work (5 days)", bm: "Kerja (5 hari)" },
  groceries:         { en: "Groceries", bm: "Barang Dapur" },
  petrol:            { en: "Petrol", bm: "Petrol" },
  freeActionsLeft:   { en: "Free actions left", bm: "Tindakan percuma" },
  salaryAutoNote:    { en: "Salary & rent handled automatically at week end", bm: "Gaji & sewa diuruskan automatik di hujung minggu" },

  // ── ObjectivesPanel ──
  weeklyObjectives:  { en: "Weekly Objectives", bm: "Objektif Mingguan" },
  workLabel:         { en: "Work", bm: "Kerja" },
  buyGroceries:      { en: "Buy Groceries", bm: "Beli Barang Dapur" },
  fillPetrol:        { en: "Fill Petrol", bm: "Isi Petrol" },
  bankExtraPayment:  { en: "Bank: Extra Payment (+20 Credit)", bm: "Bank: Bayaran Tambahan (+20 Kredit)" },
  bonus:             { en: "BONUS", bm: "BONUS" },
  todayDone:         { en: "(Today: Done)", bm: "(Hari Ini: Selesai)" },
  todayPending:      { en: "(Today: Pending)", bm: "(Hari Ini: Belum)" },
  lowEnergyWarning:  { en: "Low energy! Complete objectives to avoid game over.", bm: "Tenaga rendah! Selesaikan objektif untuk elakkan tamat permainan." },
  allObjComplete:    { en: "All objectives complete! Ready for weekend.", bm: "Semua objektif selesai! Sedia untuk hujung minggu." },

  // ── Game Page buttons ──
  current:           { en: "Current", bm: "Semasa" },
  workedToday:       { en: "Worked Today", bm: "Sudah Bekerja" },
  notWorkedYet:      { en: "Not Worked Yet", bm: "Belum Bekerja" },
  extraPaymentBtn:   { en: "Extra Payment (−RM200, +20 Credit)", bm: "Bayaran Tambahan (−RM200, +20 Kredit)" },
  nextDay:           { en: "Next Day", bm: "Hari Seterusnya" },
  endDayWorkReq:     { en: "End Day (Work Required)", bm: "Tamat Hari (Perlu Bekerja)" },
  weekendTime:       { en: "Weekend Time!", bm: "Hujung Minggu!" },
  energyDepleted:    { en: "Energy depleted! Complete objectives to continue.", bm: "Tenaga habis! Selesaikan objektif untuk teruskan." },
  resetGame:         { en: "Reset Game", bm: "Set Semula" },
  resetConfirm:      { en: "Reset game and start over?", bm: "Set semula dan mula dari awal?" },
  notEnoughMoney:    { en: "Not enough money to pay debt! You need more cash first.", bm: "Wang tidak cukup untuk bayar hutang! Anda perlukan lebih wang." },
  notEnoughGrocery:  { en: "Not enough money for groceries!", bm: "Wang tidak cukup untuk barang dapur!" },
  notEnoughFood:     { en: "Not enough money to eat here!", bm: "Wang tidak cukup untuk makan sini!" },
  alreadyBought:     { en: "You've already bought groceries this week!", bm: "Anda sudah beli barang dapur minggu ini!" },
  alreadyPaid:       { en: "You've already paid your debt this week!", bm: "Anda sudah bayar hutang minggu ini!" },

  // ── WeekendDialog ──
  weekComplete:      { en: "Week {w} Complete!", bm: "Minggu {w} Selesai!" },
  weekendPayday:     { en: "Weekend — Payday 💰", bm: "Hujung Minggu — Hari Gaji 💰" },
  paySlip:           { en: "This Week's Pay Slip", bm: "Slip Gaji Minggu Ini" },
  salary:            { en: "Salary", bm: "Gaji" },
  rentAuto:          { en: "Rent (auto)", bm: "Sewa (automatik)" },
  autoDebit:         { en: "(auto-debit)", bm: "(debit automatik)" },
  takeHome:          { en: "Take-home", bm: "Bawa Pulang" },
  remainingDebt:     { en: "Remaining debt", bm: "Baki hutang" },
  cantAfford:        { en: "Cannot afford", bm: "Tidak mampu" },
  riskCredit:        { en: "Risk: Not enough to cover instalment — credit score will drop!", bm: "Risiko: Tidak cukup untuk ansuran — skor kredit akan jatuh!" },
  finalWeekMsg:      { en: "🏁 Final week! Your choices this month determine your financial outcome.", bm: "🏁 Minggu terakhir! Pilihan anda bulan ini menentukan hasil kewangan anda." },
  weekendQuestion:   { en: "After a long week, how will you recharge? (Your take-home gets adjusted after this choice.)", bm: "Selepas minggu yang penat, bagaimana anda mahu berehat? (Pendapatan bersih anda diselaraskan selepas pilihan ini.)" },
  skipRestWarning:   { en: "Skipping rest raises stress — even saving can cost you health!", bm: "Tidak berehat menaikkan tekanan — jimat pun boleh memudaratkan!" },
  mentalHealthNote:  { en: "Mental health matters. Skipping rest is a debt you pay later.", bm: "Kesihatan mental penting. Tidak berehat adalah hutang yang dibayar kemudian." },

  // ── WeekendDialog transition warnings ──
  weekTransition1:   { en: "Your {label} instalment increases from RM {from} → RM {to}/week starting Week 2. Budget accordingly!", bm: "Ansuran {label} anda meningkat dari RM {from} → RM {to}/minggu bermula Minggu 2. Rancang bajet anda!" },
  weekTransition2:   { en: "FULL instalment kicks in from Week 3 — RM {to}/week. Random events also get harder. Boost your savings now!", bm: "Ansuran PENUH bermula dari Minggu 3 — RM {to}/minggu. Peristiwa rawak juga lebih sukar. Tingkatkan simpanan sekarang!" },
  weekTransition3:   { en: "Final week! Maximum financial pressure. Your decisions this weekend lock in your ending.", bm: "Minggu terakhir! Tekanan kewangan maksimum. Keputusan hujung minggu ini menentukan pengakhiran anda." },

  // ── GroceryDialog ──
  groceryTitle:      { en: "🛒 Grocery Shopping", bm: "🛒 Membeli Barang Dapur" },
  groceryHealthy:    { en: "Healthy Food (RM 50)", bm: "Makanan Sihat (RM 50)" },
  groceryHealthyDesc:{ en: "+10 Health, −10 Stress", bm: "+10 Kesihatan, −10 Tekanan" },
  groceryUnhealthy:  { en: "Cheap Food (RM 30)", bm: "Makanan Murah (RM 30)" },
  groceryUnhealthyDesc:{ en: "−10 Health, −15 Stress", bm: "−10 Kesihatan, −15 Tekanan" },

  // ── LeaveDialog ──
  leaveTitle:        { en: "⚠️ Work Not Completed", bm: "⚠️ Kerja Belum Selesai" },
  leaveBody:         { en: "You haven't worked today. You must either go to the office or apply for leave.", bm: "Anda belum bekerja hari ini. Anda mesti pergi ke pejabat atau mohon cuti." },
  applyLeave:        { en: "Apply Leave (−5 Credit, +15 Stress)", bm: "Mohon Cuti (−5 Kredit, +15 Tekanan)" },
  goToWork:          { en: "Go to Work", bm: "Pergi Bekerja" },

  // ── GameOverDialog ──
  gameOver:          { en: "Game Over", bm: "Tamat Permainan" },
  restart:           { en: "Try Again", bm: "Cuba Lagi" },
  mainMenu:          { en: "Main Menu", bm: "Menu Utama" },
  
  // ── SpecialEventDialog ──
  randomEvent:       { en: "Random Event!", bm: "Peristiwa Rawak!" },
  continueBtn:       { en: "Continue", bm: "Teruskan" },

  // ── TutorialDialog ──
  tutorialTitle:     { en: "Welcome to Hidup B40", bm: "Selamat Datang ke Hidup B40" },
  tutorialReady:     { en: "I'm Ready!", bm: "Saya Sedia!" },

  // ── LocationDialog ──
  generatingStory:   { en: "Generating your story...", bm: "Menjana cerita anda..." },
  closeDialog:       { en: "Close", bm: "Tutup" },

  // ── Ending Page ──
  generatingEnding:  { en: "Generating your ending...", bm: "Menjana pengakhiran anda..." },
  yourJourneyEnded:  { en: "Your 12-week journey has ended", bm: "Perjalanan 12 minggu anda telah tamat" },
  finalStats:        { en: "Final Stats", bm: "Statistik Akhir" },
  money:             { en: "Money", bm: "Wang" },
  scores:            { en: "Scores", bm: "Markah" },
  financial:         { en: "Financial", bm: "Kewangan" },
  lessonsLearned:    { en: "Lessons Learned", bm: "Pengajaran" },
  topTen:            { en: "You made it to the Top 10!", bm: "Anda berjaya masuk 10 teratas!" },
  viewLeaderboard:   { en: "View Leaderboard", bm: "Lihat Papan Pendahulu" },
  playAgain:         { en: "Play Again", bm: "Main Lagi" },

  // ── InfoSidebar ──
  gameGuide:         { en: "Game Guide", bm: "Panduan Permainan" },
  places:            { en: "Places", bm: "Tempat" },
  stats:             { en: "Stats", bm: "Statistik" },
  tips:              { en: "Tips", bm: "Tips" },
  tapToClose:        { en: "Tap anywhere outside to close", bm: "Ketik di luar untuk tutup" },

  // ── Header ──
  subtitle:          { en: "Experience financial decisions through lived experience", bm: "Rasai keputusan kewangan melalui pengalaman hidup" },

  // ── Classroom Page ──
  classroomTitle:    { en: "Classroom Mode", bm: "Mod Bilik Darjah" },
  createClass:       { en: "Create a Class", bm: "Cipta Kelas" },
  joinClass:         { en: "Join a Class", bm: "Sertai Kelas" },
} as const;

export type TranslationKey = keyof typeof T;

// Helper: get a translation string for a given key and language
export function t(key: TranslationKey, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}

// Convenience hook — use inside components with useLanguage()
import { useLanguage } from "./LanguageContext";

export function useT() {
  const { lang } = useLanguage();
  return (key: TranslationKey, replacements?: Record<string, string | number>): string => {
    let str = t(key, lang);
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };
}

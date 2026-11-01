import Link from "next/link";
import { ArrowLeft, CheckCircle2, Flame } from "lucide-react";
import { getTournament } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RulesPage() {
  const tournament = await getTournament();
  const entryFee = tournament?.entryFee ?? 50;
  const firstPrize = tournament?.firstPrize ?? 1000;
  const secondPrize = tournament?.secondPrize ?? 500;

  const rules = [
    {
      title: "Roster Integrity & Match Entry",
      items: [
        "Every squad must strictly consist of the registered players. All in-game UIDs must match the registration ticket.",
        "Custom room credentials will be published directly to your Team Ticket 15 minutes before match time.",
        "Teams failing to enter the custom room within 10 minutes of room launch will forfeit their slot with no refund.",
      ],
    },
    {
      title: "Device & Emulator Policy",
      items: [
        "Mobile phones and Tablets only. Emulators, Bluestacks, LDPlayer, and PC setups are STRICTLY PROHIBITED.",
        "Any player detected on an emulator by room referee will result in immediate disqualification for the entire squad.",
        "Third-party crosshair apps, sensitivity macro scripts, or modified APKs are strictly illegal.",
      ],
    },
    {
      title: "Fair Play & Anti-Teaming",
      items: [
        "Teaming up with opponent squads or deliberate feeding is grounds for a permanent ban across all PATELESP cups.",
        "Abusive behavior or verbal toxicity in all-chat will result in player disqualification.",
      ],
    },
    {
      title: "Scoring, Booyah & Prize Distribution",
      items: [
        `Placement Points: 1st Place (Champion) receives ₹${firstPrize.toLocaleString()} cash. 2nd Place (Runner-up) receives ₹${secondPrize.toLocaleString()} cash.`,
        "The winning squad Captain must take a screenshot of the final Booyah match scoreboard.",
        "Cash prizes will be credited directly to the winning captain's UPI ID within 30 minutes of referee verification.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-dark-950 bg-grid-pattern py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Tournament
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs font-bold text-fire-400 tracking-widest uppercase">FAIR PLAY GUIDELINES</span>
            <span className="text-xs text-gray-400">• Created by <strong className="text-fire-400">Juned Patel</strong></span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            PATELESP FREE FIRE TOURNAMENT RULES
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            Please read these guidelines thoroughly to ensure a smooth, competitive, and fair esports experience.
          </p>
        </div>

        {/* Rules Sections */}
        <div className="space-y-4 sm:space-y-6">
          {rules.map((section, idx) => (
            <div key={idx} className="gaming-card rounded-2xl p-5 sm:p-8">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                <span className="w-7 h-7 rounded-lg bg-fire-500/20 text-fire-400 flex items-center justify-center text-xs font-black">
                  0{idx + 1}
                </span>
                {section.title}
              </h3>

              <ul className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-300 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-fire-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="p-6 sm:p-8 rounded-2xl bg-fire-950/40 border border-fire-500/30 text-center space-y-4">
          <Flame className="w-8 h-8 text-fire-400 mx-auto" />
          <h3 className="text-lg sm:text-xl font-black text-white">Ready to Dominate the Battleground?</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Slots fill up fast! Register your squad now and claim your shot at the championship prize pool.
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm uppercase bg-fire-gradient text-white shadow-glow-fire hover:brightness-110 active:scale-95 transition-all"
            >
              Register Squad (₹{entryFee})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

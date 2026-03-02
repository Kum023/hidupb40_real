"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import Anthropic from "@anthropic-ai/sdk";
import { SCENARIO_SYSTEM_PROMPT, buildScenarioPrompt, ENDING_SYSTEM_PROMPT, buildEndingPrompt } from "../lib/prompts";
import { PERSONAS, LOCATIONS, PersonaId, LocationId } from "../lib/constants";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const generateScenario = action({
  args: {
    personaId: v.string(),
    location: v.string(),
    money: v.number(),
    debt: v.number(),
    creditScore: v.number(),
    health: v.number(),
    stress: v.number(),
    week: v.number(),
    day: v.number(),
    recentDecisions: v.array(
      v.object({
        choiceText: v.string(),
        location: v.string(),
        week: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userPrompt = buildScenarioPrompt({
      personaId: args.personaId as PersonaId,
      location: args.location as LocationId,
      money: args.money,
      debt: args.debt,
      creditScore: args.creditScore,
      health: args.health,
      stress: args.stress,
      week: args.week,
      day: args.day,
      recentDecisions: args.recentDecisions,
    });

    try {
      const message = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        system: SCENARIO_SYSTEM_PROMPT,
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      // Parse JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const scenario = JSON.parse(jsonMatch[0]);

      // Add location and generate unique ID
      return {
        id: `scenario_${Date.now()}`,
        location: args.location,
        ...scenario,
      };
    } catch (error) {
      console.error("AI generation error:", error);
      // Return location-specific fallback scenarios
      return getFallbackScenario(args.location as LocationId, args.money);
    }
  },
});

export const generateEnding = action({
  args: {
    personaId: v.string(),
    finalMoney: v.number(),
    finalDebt: v.number(),
    finalCreditScore: v.number(),
    finalHealth: v.number(),
    finalStress: v.number(),
    endingType: v.string(),
    keyDecisions: v.array(
      v.object({
        choiceText: v.string(),
        location: v.string(),
        week: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userPrompt = buildEndingPrompt({
      personaId: args.personaId as PersonaId,
      finalMoney: args.finalMoney,
      finalDebt: args.finalDebt,
      finalCreditScore: args.finalCreditScore,
      finalHealth: args.finalHealth,
      finalStress: args.finalStress,
      endingType: args.endingType,
      keyDecisions: args.keyDecisions,
    });

    try {
      const message = await anthropic.messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
        system: ENDING_SYSTEM_PROMPT,
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type");
      }

      // Parse JSON from response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("AI generation error:", error);
      // Return a fallback ending
      return {
        title: "The End of a Journey",
        narration:
          "Your 12-week journey has come to an end. Through highs and lows, you navigated the challenges of financial life. Every decision shaped your path.",
        summary: {
          financialScore: Math.round((args.finalMoney / 1000) * 50 + (args.finalCreditScore / 850) * 50),
          healthScore: args.finalHealth,
          lessonsLearned: [
            "Every financial decision has consequences",
            "Planning ahead makes a difference",
            "Small choices add up over time",
          ],
        },
        epilogue: "Life continues, one decision at a time.",
      };
    }
  },
});

// Fallback scenarios for each location when AI is unavailable
function getFallbackScenario(location: LocationId, currentMoney: number) {
  const fallbacks: Record<LocationId, () => object> = {
    home: () => ({
      id: `fallback_home_${Date.now()}`,
      location: "home",
      narration: "You're back at your small apartment. The rent notice on the door reminds you that bills are due soon. Your roommate left a note asking if you could lend them some money.",
      npcDialogue: {
        speaker: "Roommate's Note",
        text: "Hey, can you spot me RM50 until payday? I'll pay you back, promise!"
      },
      emotion: "stressed",
      choices: [
        {
          text: "Lend them the RM50",
          consequence: { money: -50, credit: 0, health: 0, stress: -10 },
          hiddenConsequence: "Your roommate might not pay you back"
        },
        {
          text: "Politely decline - you need every ringgit",
          consequence: { money: 0, credit: 0, health: 0, stress: 10 },
        },
        {
          text: "Rest at home to recover energy",
          consequence: { money: 0, credit: 0, health: 10, stress: -15 },
        },
      ],
    }),
    shop: () => ({
      id: `fallback_shop_${Date.now()}`,
      location: "shop",
      narration: "Pak Ali's kedai runcit is quiet today. He notices you looking at the prices and gives you a knowing smile. The instant noodles are on sale, but fresh vegetables would be healthier.",
      npcDialogue: {
        speaker: "Pak Ali",
        text: "Ah, you again! Need anything today? I can give you small discount, old customer lah."
      },
      emotion: "neutral",
      choices: [
        {
          text: "Buy instant noodles (cheap but unhealthy)",
          consequence: { money: -15, credit: 0, health: -5, stress: 0 },
        },
        {
          text: "Buy fresh vegetables and rice",
          consequence: { money: -40, credit: 0, health: 10, stress: 0 },
        },
        {
          text: "Ask Pak Ali for credit (buy now, pay later)",
          consequence: { money: 0, credit: -5, health: 5, stress: 5 },
          hiddenConsequence: "You now owe Pak Ali RM40"
        },
      ],
    }),
    petrol: () => ({
      id: `fallback_petrol_${Date.now()}`,
      location: "petrol",
      narration: "The Petronas station is busy. Your motorcycle needs fuel, but you notice they're also selling lottery tickets. A group of workers are chatting about someone who won big last week.",
      emotion: currentMoney < 100 ? "desperate" : "neutral",
      choices: [
        {
          text: "Just fill up RM20 of petrol",
          consequence: { money: -20, credit: 0, health: 0, stress: 0 },
        },
        {
          text: "Fill full tank (RM40) - saves trips later",
          consequence: { money: -40, credit: 0, health: 0, stress: -5 },
        },
        {
          text: "Buy a lottery ticket too (RM5) - feeling lucky",
          consequence: { money: -25, credit: 0, health: 0, stress: 5 },
          hiddenConsequence: "You probably won't win"
        },
      ],
    }),
    tnb: () => ({
      id: `fallback_tnb_${Date.now()}`,
      location: "tnb",
      narration: "The TNB office has a long queue. Your electricity bill is RM120 this month - higher than expected. The clerk mentions there's a late fee if not paid by Friday.",
      npcDialogue: {
        speaker: "TNB Clerk",
        text: "Your bill is RM120. Pay today or there's 10% late charge after Friday."
      },
      emotion: "stressed",
      choices: [
        {
          text: "Pay the full bill now",
          consequence: { money: -120, credit: 5, health: 0, stress: -10 },
        },
        {
          text: "Pay half now, half next week",
          consequence: { money: -60, credit: -5, health: 0, stress: 5 },
          hiddenConsequence: "You'll need to pay RM66 next week (with late fee)"
        },
        {
          text: "Leave - you'll pay it later",
          consequence: { money: 0, credit: -10, health: 0, stress: 15 },
          hiddenConsequence: "Late fees will accumulate"
        },
      ],
    }),
    office: () => ({
      id: `fallback_office_${Date.now()}`,
      location: "office",
      narration: "Another day at work. Your boss mentions there's overtime available this weekend - extra pay but you'd miss your rest day. A colleague asks if you want to chip in for a birthday collection.",
      npcDialogue: {
        speaker: "Boss",
        text: "We need people for Saturday. Double pay. You in?"
      },
      emotion: "neutral",
      choices: [
        {
          text: "Accept the overtime shift",
          consequence: { money: 150, credit: 0, health: -10, stress: 15 },
        },
        {
          text: "Decline politely - need rest",
          consequence: { money: 0, credit: 0, health: 5, stress: -10 },
        },
        {
          text: "Chip in RM20 for colleague's birthday",
          consequence: { money: -20, credit: 0, health: 0, stress: -5 },
        },
      ],
    }),
    bank: () => ({
      id: `fallback_bank_${Date.now()}`,
      location: "bank",
      narration: "The bank is cold and formal. You see advertisements for personal loans with 'low interest rates'. The officer asks if you'd like to check your credit score or apply for a credit card.",
      npcDialogue: {
        speaker: "Bank Officer",
        text: "Good morning. How can I help you today? We have special promotion for credit card - cashback 5%!"
      },
      emotion: "neutral",
      choices: [
        {
          text: "Check your credit score (free)",
          consequence: { money: 0, credit: 0, health: 0, stress: 5 },
        },
        {
          text: "Apply for credit card",
          consequence: { money: 0, credit: -5, health: 0, stress: 10 },
          hiddenConsequence: "Credit card can be a debt trap"
        },
        {
          text: "Ask about debt consolidation loan",
          consequence: { money: 0, credit: 0, health: 0, stress: -5 },
        },
      ],
    }),
    bus: () => ({
      id: `fallback_bus_${Date.now()}`,
      location: "bus",
      narration: "The bus stop is crowded. You could take the bus (cheaper) or call a Grab (faster but expensive). An elderly makcik is struggling with heavy bags.",
      emotion: "neutral",
      choices: [
        {
          text: "Take the bus (RM2, slower)",
          consequence: { money: -2, credit: 0, health: -5, stress: 10 },
        },
        {
          text: "Call a Grab (RM15, comfortable)",
          consequence: { money: -15, credit: 0, health: 0, stress: -5 },
        },
        {
          text: "Help the makcik with her bags first",
          consequence: { money: 0, credit: 0, health: -5, stress: -10 },
          hiddenConsequence: "Good karma might come back to you"
        },
      ],
    }),
    // New weekend and extra locations
    post_office: () => ({
      id: `fallback_post_office_${Date.now()}`,
      location: "post_office",
      narration: "Pos Malaysia is quiet today. You can send letters, pay bills, or do some banking here.",
      emotion: "neutral",
      choices: [
        {
          text: "Pay utility bills (convenient)",
          consequence: { money: -50, credit: 5, health: 0, stress: -5 },
        },
        {
          text: "Just browse, nothing urgent",
          consequence: { money: 0, credit: 0, health: 0, stress: 0 },
        },
      ],
    }),
    fancy_restaurant: () => ({
      id: `fallback_fancy_restaurant_${Date.now()}`,
      location: "fancy_restaurant",
      narration: "A nice restaurant in Bangsar. Smells delicious! A good meal could lift your spirits.",
      emotion: "excited",
      choices: [
        {
          text: "Treat yourself to a nice dinner",
          consequence: { money: -150, credit: 0, health: 5, stress: -25 },
        },
        {
          text: "Just get a drink and appetizer",
          consequence: { money: -50, credit: 0, health: 0, stress: -10 },
        },
      ],
    }),
    fancy_cafe: () => ({
      id: `fallback_fancy_cafe_${Date.now()}`,
      location: "fancy_cafe",
      narration: "A hipster cafe with good WiFi and Instagram-worthy drinks. Perfect for unwinding.",
      emotion: "relaxed",
      choices: [
        {
          text: "Order artisan coffee and cake",
          consequence: { money: -80, credit: 0, health: 0, stress: -15 },
        },
        {
          text: "Just get a basic coffee",
          consequence: { money: -20, credit: 0, health: 0, stress: -5 },
        },
      ],
    }),
    sunway_lagoon: () => ({
      id: `fallback_sunway_lagoon_${Date.now()}`,
      location: "sunway_lagoon",
      narration: "Sunway Lagoon! Rides, water parks, and fun awaits. A full day here would be amazing!",
      emotion: "excited",
      choices: [
        {
          text: "Full day pass - enjoy everything!",
          consequence: { money: -200, credit: 0, health: 10, stress: -35 },
        },
        {
          text: "Just walk around the mall nearby",
          consequence: { money: -30, credit: 0, health: 0, stress: -10 },
        },
      ],
    }),
    shopping_mall: () => ({
      id: `fallback_shopping_mall_${Date.now()}`,
      location: "shopping_mall",
      narration: "The shopping mall is bustling with activity. Sales everywhere!",
      emotion: "neutral",
      choices: [
        {
          text: "Window shopping only",
          consequence: { money: 0, credit: 0, health: -5, stress: -5 },
        },
        {
          text: "Buy something nice for yourself",
          consequence: { money: -100, credit: 0, health: 0, stress: -15 },
        },
      ],
    }),
    penang_hill: () => ({
      id: `fallback_penang_hill_${Date.now()}`,
      location: "penang_hill",
      narration: "Penang Hill offers a beautiful view. The fresh air and nature is therapeutic.",
      emotion: "relaxed",
      choices: [
        {
          text: "Take the funicular up and enjoy the view",
          consequence: { money: -30, credit: 0, health: 15, stress: -30 },
        },
        {
          text: "Walk the trails instead (free but tiring)",
          consequence: { money: 0, credit: 0, health: 20, stress: -20 },
        },
      ],
    }),
    restaurant: () => ({
      id: `fallback_restaurant_${Date.now()}`,
      location: "restaurant",
      narration: "A family-friendly restaurant. Your child's eyes light up seeing the menu.",
      emotion: "happy",
      choices: [
        {
          text: "Order a family meal",
          consequence: { money: -100, credit: 0, health: 5, stress: -20 },
        },
        {
          text: "Get something small, save money",
          consequence: { money: -40, credit: 0, health: 0, stress: -5 },
        },
      ],
    }),
  };

  return fallbacks[location]?.() || fallbacks.home();
}

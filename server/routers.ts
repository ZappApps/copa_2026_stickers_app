import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // OCR endpoint: receives a base64 image and returns recognized sticker codes
  ocr: router({
    recognize: publicProcedure
      .input(
        z.object({
          imageBase64: z.string().min(1),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: `You are an expert at reading FIFA World Cup 2026 Panini sticker codes.
Each sticker has a code printed on its back in the format: COUNTRYCODE + NUMBER (e.g., BRA12, SCO6, FWC1, CC10).
The country code is 2-3 uppercase letters, followed by a 1-2 digit number.
Valid country codes include: MEX, RSA, KOR, CZE, CAN, BIH, QAT, SUI, BRA, MAR, HAI, SCO, USA, PAR, AUS, TUR, GER, CUW, CIV, ECU, NED, JPN, SWE, TUN, BEL, EGY, IRN, NZL, ESP, CPV, KSA, URU, FRA, SEN, IRQ, NOR, ARG, ALG, AUT, JOR, POR, COD, UZB, COL, ENG, CRO, GHA, PAN, FWC, CC.
Extract ALL sticker codes visible in the image. Return ONLY the codes, comma-separated, nothing else. Example: BRA12, SCO6, FWC1`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: {
                      url: `data:${input.mimeType};base64,${input.imageBase64}`,
                      detail: "high",
                    },
                  },
                  {
                    type: "text",
                    text: "List all FIFA World Cup 2026 sticker codes visible in this image. Return only the codes comma-separated.",
                  },
                ],
              },
            ],
          });

          const content = response.choices?.[0]?.message?.content || "";
          return { text: content, success: true };
        } catch (error) {
          console.error("OCR error:", error);
          return { text: "", success: false, error: String(error) };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

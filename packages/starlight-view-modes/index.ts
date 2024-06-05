import type { StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types";
import { AstroError } from "astro/errors";
import { z } from "astro/zod";

import { starlightViewModesIntegration } from "./libs/integration";

const starlightViewModesConfigSchema = z
    .object({
        /**
         * Indicates if Zen Mode is enabled. When enabled, the user is able to active Zen Mode which
         * provides a distraction-free interface by hiding everything except the main content.
         *
         * @type {boolean}
         * @default true
         */
        zenModeEnabled: z.boolean().default(true),

        /**
         * Choose the position of the close button for the Zen Mode. It is only visible when the Zen Mode
         * is active and can be in one of four corners: top left, top right, bottom left, or bottom right.
         *
         * @type {enum}
         * @default "top-right"
         */
        zenModeCloseButtonPosition: z
            .enum(["top-left", "top-right", "bottom-left", "bottom-right"])
            .default("top-right"),

        /**
         * Indicates if Presentation Mode is enabled. When enabled, the user is able to active Presentation Mode which
         * converts the main content into a presentation-like view intended for teaching or presentation purposes.
         *
         * @type {boolean}
         * @default true
         */
        presentationModeEnabled: z.boolean().default(true),

        /**
         * Choose the position of the control button for the Presentation Mode. It is only visible when the Presentation Mode
         * is active and can be in one of eight corners: top left, top middle, top right, middle right, bottom left, bottom middle, bottom right, or middle left.
         *
         * @type {enum}
         * @default "middle-right"
         */
        presentationModeControlButtonPosition: z
            .enum([
                "top-left",
                "top-middle",
                "top-right",
                "middle-right",
                "bottom-left",
                "bottom-middle",
                "bottom-right",
                "middle-left",
            ])
            .default("middle-right"),
    })
    .default({});

export default function starlightViewModes(
    userConfig?: StarlightViewModesUserConfig
): StarlightPlugin {
    const parsedConfig = starlightViewModesConfigSchema.safeParse(userConfig);

    if (!parsedConfig.success) {
        throw new AstroError(
            `The provided plugin configuration is invalid.\n${parsedConfig.error.issues
                .map((issue) => issue.message)
                .join("\n")}`,
            `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/trueberryless/starlight-view-modes/issues`
        );
    }

    return {
        name: "starlight-view-modes",
        hooks: {
            setup({ addIntegration, config, logger, updateConfig }) {
                const updatedConfig: Partial<StarlightUserConfig> = {
                    components: { ...config.components },
                };

                if (!updatedConfig.components) {
                    updatedConfig.components = {};
                }

                // If the user has already has a custom override for the PageSidebar component, don't override it.
                if (config.components?.PageSidebar) {
                    logger.warn(
                        "It looks like you already have a `PageSidebar` component override in your Starlight configuration."
                    );
                    logger.warn(
                        "To render `@astrojs/starlight-view-modes`, remove the override for the `PageSidebar` component.\n"
                    );
                } else {
                    // Otherwise, add the PageSidebar component override to the user's configuration.
                    updatedConfig.components.PageSidebar =
                        "starlight-view-modes/overrides/PageSidebar.astro";
                }

                // If the user has already has a custom override for the MarkdownContent component, don't override it.
                if (config.components?.MarkdownContent) {
                    logger.warn(
                        "It looks like you already have a `MarkdownContent` component override in your Starlight configuration."
                    );
                    logger.warn(
                        "To render `@astrojs/starlight-view-modes`, remove the override for the `MarkdownContent` component.\n"
                    );
                } else {
                    // Otherwise, add the MarkdownContent component override to the user's configuration.
                    updatedConfig.components.MarkdownContent =
                        "starlight-view-modes/overrides/MarkdownContent.astro";
                }

                addIntegration(starlightViewModesIntegration(parsedConfig.data));
                updateConfig(updatedConfig);
            },
        },
    };
}

export type StarlightViewModesUserConfig = z.input<typeof starlightViewModesConfigSchema>;
export type StarlightViewModesConfig = z.output<typeof starlightViewModesConfigSchema>;
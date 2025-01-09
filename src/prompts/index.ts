import { translatorSystemPrompt, translatorUserPrompt } from "./translation";
import {
    accuracyRefinerSystemPrompt,
    accuracyRefinerUserPrompt,
    accuracyReviwerSystemPrompt,
    accuracyReviwerUserPrompt
} from "./accuracy";
import {
    fluencyRefinerSystemPrompt,
    fluencyRefinerUserPrompt,
    fluencyReviwerSystemPrompt,
    fluencyReviwerUserPrompt
} from "./fluency";
import {
    styleRefinerSystemPrompt,
    styleRefinerUserPrompt,
    styleReviewerSystemPrompt,
    styleReviewerUserPrompt
} from "./style";
import {
    formattingRefinerSystemPrompt,
    formattingRefinerUserPrompt,
    formattingReviwerSystemPrompt,
    formattingReviwerUserPrompt
} from "./formatting";
import {
    consistencyRefinerSystemPrompt,
    consistencyRefinerUserPrompt,
    consistencyReviwerSystemPrompt,
    consistencyReviwerUserPrompt
} from "./consistency";
import {
    readabilityRefinerSystemPrompt,
    readabilityRefinerUserPrompt,
    readabilityReviwerSystemPrompt,
    readabilityReviwerUserPrompt
} from "./readability";
import {
    terminologyRefinerSystemPrompt,
    terminologyRefinerUserPrompt,
    terminologyReviwerSystemPrompt,
    terminologyReviwerUserPrompt
} from "./terminology";
import {
    userRefinerSystemPrompt,
    userRefinerUserPrompt
} from "./user";

import {
    TRANSLATOR,
    ACCURACY_REVIEWER,
    ACCURACY_REFINER,
    FLUENCY_REVIEWER,
    FLUENCY_REFINER,
    STYLE_REVIEWER,
    STYLE_REFINER,
    FORMATTING_REVIEWER,
    FORMATTING_REFINER,
    CONSISTENCY_REVIEWER,
    CONSISTENCY_REFINER,
    READABILITY_REVIEWER,
    READABILITY_REFINER,
    TERMINOLOGY_REVIEWER,
    TERMINOLOGY_REFINER,
    SYSTEM_PROMPT,
    USER_PROMPT,
    USER_REFINER
} from "../constants";

const prompts = {
    [ACCURACY_REVIEWER]: {
        [SYSTEM_PROMPT]: accuracyReviwerSystemPrompt,
        [USER_PROMPT]: accuracyReviwerUserPrompt
    },
    [ACCURACY_REFINER]: {
        [SYSTEM_PROMPT]: accuracyRefinerSystemPrompt,
        [USER_PROMPT]: accuracyRefinerUserPrompt
    },
    [FLUENCY_REVIEWER]: {
        [SYSTEM_PROMPT]: fluencyReviwerSystemPrompt,
        [USER_PROMPT]: fluencyReviwerUserPrompt
    },
    [FLUENCY_REFINER]: {
        [SYSTEM_PROMPT]: fluencyRefinerSystemPrompt,
        [USER_PROMPT]: fluencyRefinerUserPrompt
    },
    [STYLE_REVIEWER]: {
        [SYSTEM_PROMPT]: styleReviewerSystemPrompt,
        [USER_PROMPT]: styleReviewerUserPrompt
    },
    [STYLE_REFINER]: {
        [SYSTEM_PROMPT]: styleRefinerSystemPrompt,
        [USER_PROMPT]: styleRefinerUserPrompt
    },
    [FORMATTING_REVIEWER]: {
        [SYSTEM_PROMPT]: formattingReviwerSystemPrompt,
        [USER_PROMPT]: formattingReviwerUserPrompt
    },
    [FORMATTING_REFINER]: {
        [SYSTEM_PROMPT]: formattingRefinerSystemPrompt,
        [USER_PROMPT]: formattingRefinerUserPrompt
    },
    [CONSISTENCY_REVIEWER]: {
        [SYSTEM_PROMPT]: consistencyReviwerSystemPrompt,
        [USER_PROMPT]: consistencyReviwerUserPrompt
    },
    [CONSISTENCY_REFINER]: {
        [SYSTEM_PROMPT]: consistencyRefinerSystemPrompt,
        [USER_PROMPT]: consistencyRefinerUserPrompt
    },
    [READABILITY_REVIEWER]: {
        [SYSTEM_PROMPT]: readabilityReviwerSystemPrompt,
        [USER_PROMPT]: readabilityReviwerUserPrompt
    },
    [READABILITY_REFINER]: {
        [SYSTEM_PROMPT]: readabilityRefinerSystemPrompt,
        [USER_PROMPT]: readabilityRefinerUserPrompt
    },
    [TERMINOLOGY_REVIEWER]: {
        [SYSTEM_PROMPT]: terminologyReviwerSystemPrompt,
        [USER_PROMPT]: terminologyReviwerUserPrompt
    },
    [TERMINOLOGY_REFINER]: {
        [SYSTEM_PROMPT]: terminologyRefinerSystemPrompt,
        [USER_PROMPT]: terminologyRefinerUserPrompt
    },
    [USER_REFINER]: {
        [SYSTEM_PROMPT]: userRefinerSystemPrompt,
        [USER_PROMPT]: userRefinerUserPrompt
    }
}

export {
    prompts
};
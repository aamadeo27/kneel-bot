
export const UPDATE_CONFIG = "UPDATE_CONFIG"
export const updateConfig = config => ({
    type: UPDATE_CONFIG,
    payload: { config }
})


export const UPDATE_BOT_STATE = "UPDATE_BOT_STATE"
export const updateBotState = botState => ({
    type: UPDATE_BOT_STATE,
    payload: { botState }
})
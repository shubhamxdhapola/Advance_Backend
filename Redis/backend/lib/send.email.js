export const sendEmail = async (email, message) => {
    await new Promise((resolve) => {
        setTimeout(resolve, 5000)
    })
    console.log(`${message}! ${email}`)
}
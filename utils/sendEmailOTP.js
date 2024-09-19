const nodemailer = require('nodemailer');

// Function to generate a 4-digit OTP
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000).toString();
}

// Function to send OTP email
async function sendOTPEmail(recipientEmail) {
    // Step 1: Generate the OTP
    const otp = generateOTP();

    // Step 2: Configure the nodemailer transport using Google SMTP
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'sskcs499@gmail.com', // Your Gmail email
            pass: 'bzgpbhkzfqrnuspo'     // Your Gmail App Password (use App Password, not the regular Gmail password)
        }
    });

    // Step 3: Define the email options
    const mailOptions = {
        from: 'sskcs499@gmail.com', // Sender's email address
        to: recipientEmail,           // Receiver's email address
        subject: 'Your Email Verification Code',
        text: `Your OTP code is: ${otp}`, // Plain text body
    };

    // Step 4: Send the email
    try {
        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${recipientEmail}`);
        return otp; // Return OTP for verification or other purposes
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw new Error('Failed to send OTP email');
    }
}

// Example usage
// (async () => {
//     const recipientEmail = 'recipient@example.com'; // Replace with the recipient's email
//     try {
//         const otp = await sendOTPEmail(recipientEmail);
//         console.log('OTP sent successfully:', otp);
//     } catch (error) {
//         console.error('Error:', error.message);
//     }
// })();

module.exports={
    sendOTPEmail:sendOTPEmail
}

import MailGen from "mailgen"
import nodemailer from "nodemailer"


const sendMail = async (options)=>{

    const mailGen = new MailGen(
        {
            theme: 'default',
            product: {
                name: 'StreetStyle',
                link: "https://streetstyle.com"
            }

        }
    )

    const genTextualMail = mailGen.generatePlaintext(options.mailGenContent)
    const genHtmlMail = mailGen.generate(options.mailGenContent)


    const transporter = nodemailer.createTransport(
        {
            host: process.env.MAILTRAP_SMTP_HOST,
            port: process.env.MAILTRAP_SMTP_PORT,
            auth: {
              user: process.env.MAILTRAP_SMTP_USER,
              pass: process.env.MAILTRAP_SMTP_PASS,
            },
          }
    )

    const mail = {
        from: "7abhishek1410@gmail.com", 
        to: options.email, 
        subject: options.subject, 
        text: genTextualMail, 
        html: genHtmlMail, 
      };


    try{

      await transporter.sendMail(mail)

    }catch(error){
        console.log("Error occured in mail service: ", error)
    }
}




const emailVerificationContent = (firstName, verificationUrl) => {
    return {
      body: {
        name: firstName,
        intro: "Welcome to StreetStyle! We're very excited to level up your fashion.",
        action: {
          instructions:
            "To verify your email please click on the following button:",
          button: {
            color: "#22BC66", 
            text: "Verify your email",
            link: verificationUrl,
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
  };
  

  const forgotPasswordContent = (firstName, passwordResetUrl) => {
    return {
      body: {
        name: firstName,
        intro: "We got a request to reset the password of our account",
        action: {
          instructions:
            "To reset your password click on the following button or link:",
          button: {
            color: "#22BC66", 
            text: "Reset password",
            link: passwordResetUrl,
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
  };


export {
    sendMail, 
    emailVerificationContent,
    forgotPasswordContent
}
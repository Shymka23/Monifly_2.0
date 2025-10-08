interface EmailTemplateData {
  [key: string]: string | number | undefined;
}

interface ResetPasswordData {
  resetLink: string;
}

interface WelcomeEmailData {
  name: string;
  loginLink: string;
}

interface NotificationEmailData {
  title: string;
  message: string;
  actionLink?: string;
  actionText?: string;
  settingsLink: string;
}

export const emailTemplates = {
  resetPassword: (data: ResetPasswordData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h1 style="color: #00B3B3; text-align: center; margin-bottom: 30px;">Скидання паролю</h1>
      
      <div style="background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <p style="font-size: 16px; line-height: 1.5;">Вітаємо!</p>
        <p style="font-size: 16px; line-height: 1.5;">Ви отримали цей лист, тому що запросили скидання паролю для вашого облікового запису Monifly.</p>
        <p style="font-size: 16px; line-height: 1.5;">Для встановлення нового паролю, натисніть кнопку нижче:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetLink}" 
             style="background-color: #00B3B3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Скинути пароль
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">Посилання дійсне протягом 15 хвилин.</p>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Якщо ви не запитували скидання паролю, проігноруйте цей лист.</p>
      </div>
    </div>
  `,

  welcomeEmail: (data: WelcomeEmailData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h1 style="color: #00B3B3; text-align: center; margin-bottom: 30px;">Ласкаво просимо до Monifly! 🎉</h1>
      
      <div style="background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <p style="font-size: 16px; line-height: 1.5;">Вітаємо, ${data.name}!</p>
        <p style="font-size: 16px; line-height: 1.5;">Дякуємо за реєстрацію в Monifly. Ми раді бачити вас у нашій спільноті!</p>
        <p style="font-size: 16px; line-height: 1.5;">Почніть керувати своїми фінансами вже зараз:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.loginLink}" 
             style="background-color: #00B3B3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Увійти в систему
          </a>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>З найкращими побажаннями,<br>Команда Monifly</p>
      </div>
    </div>
  `,

  notificationEmail: (data: NotificationEmailData): string => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
      <h1 style="color: #00B3B3; text-align: center; margin-bottom: 30px;">${
        data.title
      }</h1>
      
      <div style="background-color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px;">
        <p style="font-size: 16px; line-height: 1.5;">${data.message}</p>
        
        ${
          data.actionLink
            ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionLink}" 
             style="background-color: #00B3B3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            ${data.actionText || "Переглянути"}
          </a>
        </div>
        `
            : ""
        }
      </div>

      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
        <p>Налаштувати сповіщення ви можете в <a href="${
          data.settingsLink
        }" style="color: #00B3B3;">налаштуваннях</a>.</p>
      </div>
    </div>
  `,
};

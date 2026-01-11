# 🔧 Исправление CORS и Email уведомлений

## Проблемы
1. ❌ Форма не отправляется (данные не доходят до Google Sheets)
2. ❌ Email уведомления не приходят

## Причины
1. **Режим `no-cors`** скрывает ошибки - мы не видим что сервер возвращает ошибку
2. **Email отправляется не на тот адрес** - использовался `Session.getActiveUser().getEmail()` который не работает в веб-приложении
3. **Google Apps Script блокирует CORS** по умолчанию

## Решение

### Шаг 1: Обновите Google Apps Script код

1. Откройте ваш Google Apps Script проект
2. **Скопируйте ВЕСЬ код** из файла `google-apps-script-code.js`
3. **Замените** всё в Apps Script редакторе
4. **ВАЖНО**: В начале файла замените:

```javascript
const SPREADSHEET_ID = 'ВАШ_РЕАЛЬНЫЙ_ID_ТАБЛИЦЫ';
const NOTIFICATION_EMAIL = 'noise8301@gmail.com'; // или ваш email
```

### Шаг 2: Добавьте CORS поддержку в Apps Script

Добавьте эту функцию в **САМОЕ НАЧАЛО** вашего Apps Script кода (после констант):

```javascript
// ============================================
// CORS SUPPORT
// ============================================

function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
```

И измените функцию `createSuccessResponse()`:

```javascript
function createSuccessResponse() {
  return ContentService
    .createTextOutput(JSON.stringify({ success: true }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

function createErrorResponse(message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: false, error: message }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}
```

### Шаг 3: Сохраните и задеплойте

1. **Сохраните** (Ctrl+S)
2. **Deploy** → **Manage deployments**
3. Нажмите **✏️ Edit**
4. **Version**: выберите **New version**
5. Описание: "Added CORS support and fixed email"
6. Нажмите **Deploy**

### Шаг 4: Проверьте настройки деплоя

Убедитесь что в настройках деплоя:
- **Execute as**: Me (ваш аккаунт)
- **Who has access**: Anyone

### Шаг 5: Протестируйте

1. Откройте сайт: https://ifnoise.github.io/landing-sop/
2. **Жесткая перезагрузка**: Ctrl+Shift+R
3. Откройте консоль (F12)
4. Заполните и отправьте форму
5. В консоли должно появиться: `Ответ сервера: {success: true}`

### Шаг 6: Проверьте email

1. Проверьте папку **Входящие**
2. Если не пришло - проверьте **Спам**
3. Если и там нет - проверьте логи Apps Script:
   - **Executions** → выберите последнее → **View logs**
   - Должно быть: `Email notification sent to noise8301@gmail.com`

## Если email все равно не приходят

### Вариант 1: Проверьте лимиты Gmail
Google Apps Script имеет лимиты на отправку email:
- **Бесплатный аккаунт**: 100 email/день
- **Google Workspace**: 1500 email/день

### Вариант 2: Проверьте код отправляется ли email
Добавьте в функцию `sendEmailNotification` больше логирования:

```javascript
function sendEmailNotification(data) {
  try {
    Logger.log('🔔 Начинаю отправку email...');
    Logger.log('Email адрес: ' + NOTIFICATION_EMAIL);
    
    if (!NOTIFICATION_EMAIL || NOTIFICATION_EMAIL === 'noise8301@gmail.com') {
      Logger.log('⚠️ ВНИМАНИЕ: Укажите ваш email в константе NOTIFICATION_EMAIL');
    }
    
    const cache = CacheService.getScriptCache();
    const lastEmailTime = cache.get('last_email_time');
    const now = Date.now();
    
    Logger.log('Последняя отправка: ' + lastEmailTime);
    Logger.log('Текущее время: ' + now);
    
    if (!lastEmailTime || (now - parseInt(lastEmailTime)) > 300000) {
      Logger.log('✅ Rate limit OK, отправляю email...');
      
      MailApp.sendEmail({
        to: NOTIFICATION_EMAIL,
        subject: '🌾 Новая заявка с Landing SOP',
        htmlBody: '...' // ваш HTML
      });
      
      cache.put('last_email_time', now.toString(), 600);
      Logger.log('✅ Email успешно отправлен!');
      
    } else {
      const waitTime = Math.ceil((300000 - (now - parseInt(lastEmailTime))) / 1000);
      Logger.log('⏳ Rate limit: подождите ' + waitTime + ' секунд');
    }
    
  } catch (error) {
    Logger.log('❌ Email error: ' + error.toString());
  }
}
```

### Вариант 3: Убедитесь что email разрешен в настройках проекта

1. В Apps Script редакторе слева нажмите **⚙️ Project Settings**
2. Прокрутите вниз до **Google Services**
3. Убедитесь что **Gmail API** включен (если есть)

## Тестирование

### Успешная отправка выглядит так:

**В консоли браузера:**
```
Отправляемые данные: {timestamp: "...", name: "...", ...}
Ответ сервера: {success: true}
```

**В Apps Script Executions logs:**
```
Form submitted successfully: noise8301@gmail.com
Email notification sent to noise8301@gmail.com
```

**В Google Sheets:**
Новая строка с данными в правильных колонках

**В вашей почте:**
Письмо с темой "🌾 Новая заявка с Landing SOP"

---

## Быстрая проверка списка

- [ ] Обновил код в Google Apps Script
- [ ] Добавил функцию `doOptions()` для CORS
- [ ] Обновил `createSuccessResponse()` и `createErrorResponse()` с CORS headers
- [ ] Указал свой `SPREADSHEET_ID`
- [ ] Указал свой `NOTIFICATION_EMAIL`
- [ ] Сохранил код (Ctrl+S)
- [ ] Задеплоил новую версию (Deploy → New version)
- [ ] Проверил что "Who has access" = "Anyone"
- [ ] Сделал жесткую перезагрузку сайта (Ctrl+Shift+R)
- [ ] Открыл консоль браузера (F12)
- [ ] Отправил тестовую форму
- [ ] Проверил консоль - там `{success: true}`
- [ ] Проверил Google Sheets - данные появились
- [ ] Проверил почту (Входящие и Спам)
- [ ] Проверил Apps Script Executions logs

Если все галочки стоят, но email не приходит - проверьте логи Apps Script на наличие ошибок при отправке email!

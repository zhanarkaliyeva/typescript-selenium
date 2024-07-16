import { writeFile } from 'fs/promises';
import path from 'path';
import {Builder, By, until } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome'

async function testFunction () {
    const options = new chrome.Options();
    const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

    // Open the testing page
    console.log('1. Opening the webpage');
    await driver.get('https://ultimateqa.com/complicated-page');
    
    // In the input, type in my name
    console.log('2. Typing the name in to Name input')
    const inputName = await driver.findElement(By.id('et_pb_contact_name_0'));
    await inputName.sendKeys('Zhanar');

    // Into email input, add fake email
    console.log('3. Adding email in to email input');
    const inputEmail = await driver.findElement(By.id('et_pb_contact_email_0'));
    await inputEmail.sendKeys('fake@example.com');

    // Test that when clicking Submit, it shows error
    console.log('4. Clicking Submit button without providing message and captcha');
    const submitButton = await driver.findElement(By.xpath('//*[@id="et_pb_contact_form_0"]//button[@type="submit"]'));
    await submitButton.click();

    // Check the error message "Please, fill in the following fields: Message, Captcha"
    await driver.wait(until.elementLocated(By.xpath('//p[contains(text(),"Please, fill in the following fields:")]')));
    await driver.findElement(By.xpath('//li[contains(text(),"Message")]'));
    await driver.findElement(By.xpath('//li[contains(text(),"Captcha")]'));
    console.log('5. Error message appears');

    // Type in the message input
    console.log('6. Adding message');
    const inputMessage = await driver.findElement(By.id('et_pb_contact_message_0'));
    await inputMessage.sendKeys('This is a test message');

    // Solve captcha
    const captchaQuestion = await driver.findElement(By.xpath('//*[@id="et_pb_contact_form_0"]//*[@class="et_pb_contact_captcha_question"]')).getText();
    let numbers = captchaQuestion.match(/\d+/g);

    if (numbers && numbers.length === 2) {
        const firstNumber = parseInt(numbers[0]);
        const secondNumber = parseInt(numbers[1]);
        const captchaAnswer = firstNumber + secondNumber;
        const captchaInput = await driver.findElement(By.xpath('//*[@id="et_pb_contact_form_0"]//input[@class="input et_pb_contact_captcha et_contact_error"]'));
        console.log('7. Adding captcha');
        await captchaInput.sendKeys(captchaAnswer);
    } else {
        console.error('Failed to extract numbers from captcha');
    }
    console.log('8. Clicking Submit button again');
    await submitButton.click();

    // Verify that form was successfully submitted
    await driver.wait(until.elementLocated(By.xpath('//*[@id="et_pb_contact_form_0"]//p[contains(text(),"Thanks for contacting us")]')));
    console.log('9. Verified that form has been submitted');

    // Take a screenshot of successful page
    console.log('10. Take a screenshot of a successful page');
    const screenshot = await driver.takeScreenshot();
    const filePath = path.join(__dirname, 'screenshot.png');
    await writeFile(filePath, screenshot,'base64');
    console.log(`11. File's been written to ${filePath}`);

    // Quit the browser
    await driver.quit();
    
}

testFunction();
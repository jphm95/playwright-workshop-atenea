import { Page, Locator } from '@playwright/test';

export class ModalTransferMoney {
    readonly page: Page;
    readonly emailReceptorInput: Locator;
    readonly originAccountDropdown: Locator;
    readonly quantityInput: Locator;
    readonly sendButton: Locator;
    readonly cancelButton: Locator;
    readonly originAccountOption: Locator;


    constructor(page: Page) {
        this.page = page;
        this.emailReceptorInput = page.getByRole('textbox', { name: 'Email del destinatario *' });
        this.originAccountDropdown = page.getByRole('combobox', { name: 'Cuenta origen *' });
        this.quantityInput = page.getByRole('spinbutton', { name: 'Monto a enviar *' });
        this.sendButton = page.getByRole('button', { name: 'Enviar' });
        this.cancelButton = page.getByRole('button', { name: 'Cancelar' });
        this.originAccountOption = page.getByRole('option', { name: '••••' })
    }

    async navigateToDashboardPage() {
        await this.page.goto('http://localhost:3000/dashboard');
        await this.page.waitForLoadState('networkidle');
    }

    async fillTransferFormAndClickSend(emailReceptor: string, quantity: string) {
        await this.emailReceptorInput.fill(emailReceptor);
        await this.originAccountDropdown.click();
        await this.originAccountOption.click();
        await this.quantityInput.fill(quantity);
        await this.sendButton.click();
    }


}

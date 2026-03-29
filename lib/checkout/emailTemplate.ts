/**
 * Generates the HTML email body for an order receipt.
 *
 * @param params - Order details for the email
 * @returns HTML string for the receipt email
 */
export function buildReceiptEmailHtml(params: {
  orderNumber: string;
  items: { title: string; quantity: number; price: number }[];
  keys: { title: string; keys: string[] }[];
  subtotal: number;
  tax: number;
  total: number;
}): string {
  const { orderNumber, items, keys, subtotal, tax, total } = params;

  const itemsRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border: 1px solid #ddd;">${item.title}</td>
          <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">${item.price.toFixed(2)} грн</td>
        </tr>`,
    )
    .join("");

  const keysBlocks = keys
    .map(
      (keyItem) => `
        <div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #007bff;">
          <p style="margin: 5px 0;"><strong>${keyItem.title}</strong></p>
          ${keyItem.keys
            .map(
              (key) =>
                `<p style="margin: 5px 0; font-family: monospace; background: white; padding: 5px; border: 1px solid #ddd;">${key}</p>`,
            )
            .join("")}
        </div>`,
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Дякуємо за покупку!</h2>
      <p><strong>Номер замовлення:</strong> ${orderNumber}</p>
      <p><strong>Дата:</strong> ${new Date().toLocaleString()}</p>
      <h3>Куплені товари:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Гра</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Кількість</th>
            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Ціна</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <h3 style="margin-top: 20px;">Ключі активації:</h3>
      ${keysBlocks}
      <div style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px;">
        <p><strong>Підсумок:</strong></p>
        <p>Ціна: ${subtotal.toFixed(2)} грн</p>
        <p>ПДВ (20%): ${tax.toFixed(2)} грн</p>
        <p style="font-size: 18px; color: #007bff;"><strong>Всього: ${total.toFixed(2)} грн</strong></p>
      </div>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Це автоматичний лист. Будь ласка, збережіть його для вашого обліку.
      </p>
    </div>
  `;
}

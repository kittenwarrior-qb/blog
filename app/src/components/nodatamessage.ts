export function nodatamessage(message: string = "No data founds"): string {
  return `
    <div class="text-center w-full !p-4 bg-gray-100">
      <p>${message}</p>
    </div>
  `;
}

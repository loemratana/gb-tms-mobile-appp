/**
 * Ready-made Khmer phrases, so common notes take one tap. Edit the wording here; each has its
 * English meaning above it.
 */

/** For "What did you do?" when submitting work. Tapping one adds it to the note. */
export const WORK_NOTE_PHRASES: readonly string[] = [
  // I've finished this task.
  "ខ្ញុំបានបញ្ចប់ការងារនេះរួចរាល់ហើយ។",
  // Done as instructed — please review.
  "ការងារបានធ្វើរួចតាមការណែនាំ សូមពិនិត្យ។",
  // I've attached photos and files as proof.
  "ខ្ញុំបានភ្ជាប់រូបភាព និងឯកសារជាភស្តុតាង។",
  // I've made the changes from the last review.
  "បានកែតម្រូវតាមមតិយោបល់មុនរួចហើយ។",
  // Please review, and tell me if anything needs changing.
  "សូមពិនិត្យ ហើយប្រាប់ខ្ញុំប្រសិនបើត្រូវកែបន្ថែម។",
];

/** Friendly words for the assignee when a manager approves their work. Tapping one fills the comment. */
export const APPROVE_COMMENT_PHRASES: readonly string[] = [
  // Great job! Thank you for your effort.
  "ធ្វើបានល្អណាស់! អរគុណសម្រាប់ការខិតខំ។",
  // Good work, and on time. Thank you!
  "ការងារល្អ និងទាន់ពេលវេលា។ អរគុណ!",
  // Very good — keep up this quality.
  "ល្អណាស់ បន្តរក្សាគុណភាពបែបនេះ។",
  // Thank you — the work is clear and complete.
  "អរគុណច្រើន ការងារច្បាស់លាស់ និងពេញលេញ។",
  // Approved. Nice work on the changes.
  "យល់ព្រម។ ល្អណាស់សម្រាប់ការកែតម្រូវ។",
];

/** Adds a phrase on its own line after what's already written. */
export function appendPhrase(text: string, phrase: string): string {
  const current = text.trimEnd();
  return current ? `${current}\n${phrase}` : phrase;
}

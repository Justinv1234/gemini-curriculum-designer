// Run this in the browser console (F12 → Console) on your curriculum designer page
// to dump all your curriculum content to the clipboard as JSON.
//
// Alternatively, just click "Download Markdown (.zip)" on the Review page.

(function() {
  const raw = localStorage.getItem('curriculum-designer-storage');
  if (!raw) {
    console.log('No curriculum data found in localStorage.');
    return;
  }

  const data = JSON.parse(raw);
  const state = data.state;

  console.log('=== CURRICULUM DATA ===');
  console.log('Course Info:', JSON.stringify(state.courseInfo, null, 2));
  console.log('Modules:', state.modules?.length ?? 0);

  // Build markdown content
  const files = [];

  if (state.topicLandscape) {
    files.push({ name: 'resources.md', content: state.topicLandscape });
  }

  const moduleContent = (state.modules ?? [])
    .filter(m => m.content)
    .map(m => m.content)
    .join('\n\n---\n\n');

  if (moduleContent) {
    files.push({ name: 'curriculum.md', content: moduleContent });
  }

  if (state.assessmentsContent) {
    files.push({ name: 'assessments.md', content: state.assessmentsContent });
  }

  if (state.deliveryContent) {
    files.push({ name: 'delivery-plan.md', content: state.deliveryContent });
  }

  // Copy the full JSON to clipboard
  const output = JSON.stringify({ files, rawState: state }, null, 2);
  navigator.clipboard.writeText(output).then(() => {
    console.log('Full curriculum data copied to clipboard! Paste it into a file.');
    console.log('Files included:', files.map(f => f.name).join(', '));
  }).catch(() => {
    // Fallback: log it
    console.log('Could not copy to clipboard. Here is the data:');
    console.log(output);
  });
})();

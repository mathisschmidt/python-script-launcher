

// const downloadFile = (fileName) => {
//   showToast('info', 'Download Started', `Downloading ${fileName}...`);
//
//   const blob = new Blob([`Mock content for ${fileName}\nGenerated on ${new Date().toLocaleString()}`], { type: 'text/plain' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = fileName;
//   document.body.appendChild(a);
//   a.click();
//   document.body.removeChild(a);
//   URL.revokeObjectURL(url);
//
//   setTimeout(() => {
//     showToast('success', 'Download Complete', `${fileName} has been downloaded successfully.`);
//   }, 1000);
// };
//
// const handleFileUpload = (file) => {
//   if (file.type === 'application/x-yaml' || file.name.endsWith('.yml') || file.name.endsWith('.yaml') || file.type === 'text/plain') {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       setYamlContent(e.target.result);
//       showToast('success', 'File Uploaded', `${file.name} has been loaded.`);
//     };
//     reader.readAsText(file);
//   } else {
//     showToast('error', 'Invalid File', 'Please upload a YAML file (.yml or .yaml)');
//   }
// };

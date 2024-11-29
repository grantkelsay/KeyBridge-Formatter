document.addEventListener('DOMContentLoaded', () => {
    const inputXml = document.getElementById('inputXml');
    const outputXml = document.getElementById('outputXml');
    const formatButton = document.getElementById('formatButton');
    const jsButton = document.getElementById('jsButton');
    const javaButton = document.getElementById('javaButton');
    const copyButton = document.getElementById('copyButton');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeLabel = document.getElementById('darkModeLabel');
    const body = document.body;

    // Load saved preference from localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        body.classList.add('dark-mode');
        // Apply dark mode class to all buttons
        const buttons = document.querySelectorAll('button');

        buttons.forEach(button => {
            button.classList.toggle('dark-mode', isDarkMode);
        });

        const footers = document.querySelectorAll('footer');

        footers.forEach(footer => {
            footer.classList.toggle('dark-mode', isDarkMode);
        });

        darkModeToggle.checked = true; // Sync checkbox with state
        darkModeLabel.textContent = 'Switch to Light Mode';
    } else {
        darkModeLabel.textContent = 'Switch to Dark Mode';
    }

    // Toggle dark mode on input change
    darkModeToggle.addEventListener('change', () => {
        const isCurrentlyDark = darkModeToggle.checked;
        body.classList.toggle('dark-mode', isCurrentlyDark);

        // Apply dark mode class to all buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.classList.toggle('dark-mode', isCurrentlyDark);
        });

        const footers = document.querySelectorAll('footer');

        footers.forEach(footer => {
            footer.classList.toggle('dark-mode', isCurrentlyDark);
        });

        // Save the dark mode setting in localStorage
        localStorage.setItem('darkMode', isCurrentlyDark);

        // Update button label (if necessary)
        updateButtonLabel(isCurrentlyDark);
    });

    function updateButtonLabel(isDark) {
        darkModeLabel.textContent = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  
    // Initially disable the copy button
    copyButton.disabled = true;
  
    // Format XML when the format button is clicked
    formatButton.addEventListener('click', () => {
      try {
        const formattedXml = vkbeautify.xml(inputXml.value.trim(), "  ");
        outputXml.value = formattedXml;
        copyButton.disabled = formattedXml.trim() === '';
      } catch (error) {
        console.error('Error formatting XML:', error);
        outputXml.value = 'Invalid XML format.';
        copyButton.disabled = true;
      }
    });
  
    // Generate JavaScript when the JavaScript button is clicked
    jsButton.addEventListener('click', () => {
      try {
        const xmlString = inputXml.value.trim();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const jsCode = generateJavaScript(xmlDoc);
        outputXml.value = jsCode;
        copyButton.disabled = jsCode.trim() === '';
      } catch (error) {
        console.error('Error generating JavaScript:', error);
        outputXml.value = 'Invalid XML format for JavaScript generation.';
        copyButton.disabled = true;
      }
    });
  
    // Generate Java when the Java button is clicked
    javaButton.addEventListener('click', () => {
      try {
        const xmlString = inputXml.value.trim();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "application/xml");
        const javaCode = generateJava(xmlDoc);
        outputXml.value = javaCode;
        copyButton.disabled = javaCode.trim() === '';
      } catch (error) {
        console.error('Error generating Java:', error);
        outputXml.value = 'Invalid XML format for Java generation.';
        copyButton.disabled = true;
      }
    });
  
    // Copy to clipboard when the copy button is clicked
    copyButton.addEventListener('click', () => {
        outputXml.select();
        document.execCommand('copy');
    
        // Create the popup element
        const popup = document.createElement('div');
        popup.textContent = 'Copied to clipboard!';
        popup.className = 'popup-notification';
    
        // Add the popup to the DOM
        document.body.appendChild(popup);
    
        // Remove the popup after the animation completes (2 seconds)
        setTimeout(() => {
        popup.remove();
        }, 2000); // Match this to animation duration in CSS
    });
  
    // Function to generate JavaScript code
    function generateJavaScript(xmlDoc) {
        let js = 'var xml = new CR.XML();\n';
        
        const query = xmlDoc.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'query')[0];
        const sequence = query.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'sequence')[0];
        
        if (sequence) {
            js += 'var sequence = xml.addContainer(xml.getRootElement(), \'sequence\');\n';
            
            const transaction = sequence.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'transaction')[0];
            if (transaction) {
                js += 'var transaction = xml.addContainer(sequence, \'transaction\');\n';
                
                const step = transaction.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'step')[0];
                if (step) {
                    js += 'var step = xml.addContainer(transaction, \'step\');\n';
                    
                    const records = step.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'record');
                    Array.from(records).forEach(record => {
                        js += 'var record = xml.addContainer(step, \'record\');\n';
                        
                        const operation = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'operation')[0];
                        if (operation) {
                            js += `xml.addOption(record, 'operation', '${operation.getAttribute('option')}');\n`;
                        }
                        
                        const includeRowDescriptions = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'includeRowDescriptions')[0];
                        if (includeRowDescriptions) {
                            js += `xml.addOption(record, 'includeRowDescriptions', '${includeRowDescriptions.getAttribute('option')}');\n`;
                        }
                        
                        const tableName = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'tableName')[0];
                        if (tableName) {
                            js += `xml.add(record, 'tableName', '${tableName.textContent}');\n`;
                        }
                        
                        const targetSerial = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'targetSerial')[0];
                        if (targetSerial) {
                            js += `xml.add(record, 'targetSerial', '${targetSerial.textContent}');\n`;
                        }
                        
                        const fields = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'field');
                        Array.from(fields).forEach(field => {
                            js += 'var field = xml.addContainer(record, \'field\');\n';
                            
                            const columnName = field.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'columnName')[0];
                            if (columnName) {
                                js += `xml.add(field, 'columnName', '${columnName.textContent}');\n`;
                            }
                            
                            const fieldOperation = field.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'operation')[0];
                            if (fieldOperation) {
                                js += `xml.addOption(field, 'operation', '${fieldOperation.getAttribute('option')}');\n`;
                            }
                            
                            const newContents = field.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'newContents')[0];
                            if (newContents) {
                                js += `xml.add(field, 'newContents', '${newContents.textContent}');\n`;
                            }
                        });
                    });
                }
            }
        }
        return js;
    }

    function generateJava(xmlDoc) {
        let javaCode = 'xml.put("sequence"); // Add a transaction element to the XML.\n';
    
        const query = xmlDoc.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'query')[0];
        const sequence = query.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'sequence')[0];
    
        if (sequence) {
            javaCode += '{\n';
            const transaction = sequence.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'transaction')[0];
            if (transaction) {
                javaCode += '    xml.put("transaction"); // Add a transaction element to the XML.\n';
    
                const step = transaction.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'step')[0];
                if (step) {
                    javaCode += '    {\n';
                    javaCode += '        xml.put("step"); // Add a step element to the XML.\n';
    
                    const records = step.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'record');

                    Array.from(records).forEach(record => {
                        javaCode += '        {\n';
                        javaCode += '            xml.put("record"); // Add a record element to the XML.\n';
    
                        const operation = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'operation')[0];
                        if (operation) {
                            javaCode += '            {\n';
                            javaCode += `                xml.putOption("operation", "${operation.getAttribute('option')}"); // This is an "${operation.getAttribute('option')}" operation.\n`;
                        }
    
                        const includeRowDescriptions = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'includeRowDescriptions')[0];
                        if (includeRowDescriptions) {
                            javaCode += `                xml.putOption("includeRowDescriptions", "${includeRowDescriptions.getAttribute('option')}");\n`;
                        }
    
                        const tableName = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'tableName')[0];
                        if (tableName) {
                            javaCode += `                xml.put("tableName", "${tableName.textContent}");\n`;
                        }
    
                        const targetSerial = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'targetSerial')[0];
                        if (targetSerial) {
                            javaCode += `                xml.put("targetSerial", "${targetSerial.textContent}");\n`;
                        }
    
                        const fields = record.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'field');
                        Array.from(fields).forEach(field => {
                            javaCode += '                xml.put("field"); // Add a field element to the XML.\n';
    
                            const columnName = field.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'columnName')[0];
                            if (columnName) {
                                javaCode += '                {\n';
                                javaCode += `                    xml.put("columnName", "${columnName.textContent}");\n`;
                            }
    
                            const fieldOperation = field.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'operation')[0];
                            if (fieldOperation) {
                                javaCode += `                    xml.putOption("operation", "${fieldOperation.getAttribute('option')}");\n`;
                            }
    
                            const newContents = field.getElementsByTagNameNS('http://www.corelationinc.com/queryLanguage/v1.0', 'newContents')[0];
                            if (newContents) {
                                javaCode += `                    xml.put("newContents", "${newContents.textContent}");\n`;
                            }
    
                            javaCode += '                }\n';
                            javaCode += '                xml.put(); // Close the field element.\n';
                        });
    
                        javaCode += '            }\n';
                        javaCode += '            xml.put(); // Close the record element.\n';
                    });
    
                    javaCode += '        }\n';
                    javaCode += '        xml.put(); // Close the step element.\n';
                }
    
                javaCode += '    }\n';
                javaCode += '    xml.put(); // Close the transaction element.\n';
            }
                javaCode += '}\n';
                javaCode += 'xml.put(); // Close the sequence element.\n';
        }
    
        return javaCode;
    }
    
});

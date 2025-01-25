const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

// Helper function to process template variables
async function processTemplate(template, variables) {
    let processedTemplate = template;
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        processedTemplate = processedTemplate.replace(regex, value);
    }
    return processedTemplate;
}

// Helper function to process markdown content
async function processMarkdown(content) {
    // Parse frontmatter
    const { data: frontMatter, content: markdownContent } = matter(content);
    
    // Configure marked options if needed
    marked.setOptions({
        gfm: true,
        breaks: true,
        smartLists: true
    });

    // Convert markdown to HTML
    const htmlContent = marked.parse(markdownContent);

    return {
        frontMatter,
        htmlContent
    };
}

async function build() {
    try {
        // Add debug logging
        const templatePath = path.join(__dirname, '../templates/base.html');
        console.log('Looking for template at:', templatePath);

        // Create dist directory if it doesn't exist
        await fs.mkdir(path.join(__dirname, '../dist'), { recursive: true });

        // First, read the base template
        let baseTemplate;
        try {
            baseTemplate = await fs.readFile(templatePath, 'utf-8');
            console.log('Successfully loaded template');
        } catch (error) {
            console.error('Error loading template:', error);
            return;
        }

        // Read and convert markdown files
        const contentDir = path.join(__dirname, '../src/content/pages');
        console.log('Looking for content in:', contentDir);

        const files = await fs.readdir(contentDir);
        console.log('Found files:', files);

        for (const file of files) {
            if (path.extname(file) === '.md') {
                const filePath = path.join(contentDir, file);
                console.log('Processing file:', filePath);

                const content = await fs.readFile(filePath, 'utf-8');
                
                // Process markdown and get frontmatter and HTML content
                const { frontMatter, htmlContent } = await processMarkdown(content);

                // Create template variables object
                const templateVars = {
                    content: htmlContent,
                    title: frontMatter.title || 'Untitled',
                    ...frontMatter // Spread other frontmatter variables
                };

                // Process the template with variables
                const finalHtml = await processTemplate(baseTemplate, templateVars);

                // Write to dist directory
                const outputPath = path.join(__dirname, '../dist', file.replace('.md', '.html'));
                await fs.writeFile(outputPath, finalHtml);
                console.log('Created:', outputPath);
            }
        }

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        // Log the full error stack for debugging
        console.error(error.stack);
    }
}

build();
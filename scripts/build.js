const fs = require('fs').promises;
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

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
                
                // Parse frontmatter
                const frontMatter = matter(content);
                
                // Convert markdown to HTML (use parsed content)
                const htmlContent = marked.parse(frontMatter.content);

                // You can now use frontMatter.data to access the metadata
                // For example: frontMatter.data.title, frontMatter.data.date, etc.

                // Insert the HTML content into the base template
                const finalHtml = baseTemplate.replace('{{content}}', htmlContent);

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
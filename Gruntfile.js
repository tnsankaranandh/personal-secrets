module.exports = function(grunt) {
  grunt.initConfig({
    clean: [
      'public'
    ],
    inline: {
      dist: {
        // src: 'public_src/listSecrets/index.html', // Source HTML file
        // dest: 'public/listSecrets/index.html', // Destination HTML file with inlined content

        files: [{
          expand: true, // Enable dynamic expansion of src-dest file mappings
          cwd: './public_src/', // The current working directory to find src files
          src: ['**/*.html',], // Pattern to match multiple HTML or Jade files
          dest: 'public' // The destination directory for processed files
        }],
        options: {
          uglify: false // Optionally minify JavaScript before inlining
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.registerTask('default', ['clean', 'inline']);
};
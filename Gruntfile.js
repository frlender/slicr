module.exports = function(grunt) {

  grunt.initConfig({
    jade: {
         compile: {
        options: {
          data: {dev:true},
          pretty: true
        },
        files: [{
          expand:true,
          cwd:"views/",
          src: ["*.jade"],
          dest:'public/',
          ext:'.html'
        }]
      },
        release: {
        options: {
          data: {dev:false},
          pretty: true
        },
        files: [{
          expand:true,
          cwd:"views/",
          src: ["*.jade"],
          dest:'public/',
          ext:'.html'
        }]
      }
    },
    watch: {
      "jade:compile":{
        files:["views/*.jade"],
        tasks:["jade:compile"]
      },
      "less:development":{
        files:["public/css/*.less"],
        tasks:["less:development"]
      }
    },
    // concat:{
    //   options:{
    //     seperator:";",
    //   },
    //   dist：{
    //     src: ['public/scripts/test-scatter.js','public/scripts/expandable.js'],
    //     dest: 'public/scripts/built.js'
    //   }
    // },
    uglify:{
      built:{
        files:{
          "public/dist/main.min.js":[
          'public/scripts/*'
          ]
        }
      }
    },
    env:{
      dev:{
        NODE_ENV:"dev"
      },
      product:{
        NODE_ENV:"product"
      }
    },
    express:{
      dev:{
        options:{
          script:'index.js'
        }
      }
    },
    less:{
      development:{
        options:{
          paths:['public/css']
        },
        files:{
          "public/css/dcic.css":"public/css/dcic.less"
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-contrib-less');

  grunt.registerTask('default', ['env:dev','express:dev','watch']);
  grunt.registerTask('deploy', ['jade:release','uglify:built','env:product','express:dev','watch']);

  grunt.registerTask('release',['jade:release','uglify']);

};
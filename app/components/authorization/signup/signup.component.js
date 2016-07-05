'use strict';
angular.module('signup', [])
  .component('signup', {
    templateUrl: 'components/authorization/signup/signup.template.html',
    controller: function signupCtrl() {
      //this.ppattern =new RegExp("/^(0|[1-9][0-9]*)$/");

      this.signup = function(isvalid) {
        if (isvalid) {
          this.message = 'Welcome to Green tourism';
        } else {
          this.message = 'Please complete the form as required ';
          this.showError = true;
        }
      };

      this.getErrorpassword = function(error) {
        if (angular.isDefined(error)) {
          if (error.pattern) {
            return 'Only digits are allowed';
          } else if (error.maxlength) {
            return 'Sorry, but less then 25 characters is allowed';
          } else if (error.minlength) {
            return 'Please input more then 7 characters';
          } else if (error.validation) {
            return 'Password isn\'t match';
          } else if (error.required) {
            return 'Please fill up this field';
          }
        }
      };

      this.getError = function(error) {
        if (angular.isDefined(error)) {
          if (error.required) {
            return 'Please fill up this field';
          } else if (error.email) {
            return 'Please input correct email';
          } else if (error.minlength) {
            return 'Please input more then 2 characters';
          } else if (error.maxlength) {
            return 'Sorry, but less then 15 characters is allowed';
          }
        }
      };
    }
  })
  .directive('confirmPassword', [function() {
    return {
      require: 'ngModel',
      link: function(scope, elem, attrs, ctrl) {
        var password = '#' + attrs.confirmPassword;
        elem.add(password).on('keyup', function() {
          scope.$apply(function() {
            ctrl.$setValidity('validation', elem.val() === $(password).val());
          });
        });
      }
    };
  }]);

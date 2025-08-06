export const emailValidator = (email: string): boolean => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

export const passwordValidator = (password: string): boolean => {
  // 至少包含一个小写字母、一个大写字母、一个数字和一个特殊字符，且长度至少为8个字符
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return regex.test(password);
};

export const validateFormField = (field: string, value: string): string | true => {
  if (!value) return '此字段不能为空';
  
  switch (field) {
    case 'email':
      return emailValidator(value) ? true : '请输入有效的电子邮件地址';
    case 'password':
      return passwordValidator(value) ? true : '密码至少需包含一个小写字母、一个大写字母、一个数字和一个特殊字符，且长度至少为8个字符';
    default:
      return true;
  }
}; 
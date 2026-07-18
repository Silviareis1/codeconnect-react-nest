export type PasswordRequirement = {
  id: 'length' | 'uppercase' | 'lowercase' | 'number' | 'special';
  label: string;
  met: boolean;
};

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    { id: 'length', label: 'Mínimo de 8 caracteres', met: password.length >= 8 },
    { id: 'uppercase', label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
    { id: 'number', label: 'Um número', met: /\d/.test(password) },
    { id: 'special', label: 'Um caractere especial', met: /[^A-Za-z0-9]/.test(password) },
  ];
}

export function isPasswordValid(password: string) {
  return (
    password.length <= 128 &&
    getPasswordRequirements(password).every((requirement) => requirement.met)
  );
}

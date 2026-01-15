-- Create trigger on auth.users to automatically create profile and role
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Note: To create an admin account, you need to:
-- 1. Sign up with admin@vincentian.edu / admin123 through the app
-- 2. Then run this to upgrade the role to admin:
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'admin@vincentian.edu');
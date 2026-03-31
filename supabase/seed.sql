-- Insert sample clients
INSERT INTO public.clients (full_name, staff_id, company_name, department, daily_limit, monthly_limit)
VALUES 
  ('John Doe', 'EMP001', 'TechCorp', 'Engineering', 50.00, 500.00),
  ('Jane Smith', 'EMP002', 'TechCorp', 'Marketing', 30.00, 300.00),
  ('Robert Wilson', 'EMP003', 'GlobalLogistics', 'Operations', 40.00, 450.00)
ON CONFLICT (staff_id) DO NOTHING;

-- Insert sample orders
WITH first_client AS (SELECT id FROM public.clients WHERE staff_id = 'EMP001' LIMIT 1),
     second_client AS (SELECT id FROM public.clients WHERE staff_id = 'EMP002' LIMIT 1)
INSERT INTO public.orders (client_id, amount, items, status, created_at)
SELECT id, 15.50, 'Chicken Salad, Water', 'APPROVED', NOW() - INTERVAL '2 hours' FROM first_client
UNION ALL
SELECT id, 12.00, 'Pasta, Juice', 'APPROVED', NOW() - INTERVAL '1 day' FROM second_client;
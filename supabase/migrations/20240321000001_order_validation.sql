-- Function to validate order credit limit
CREATE OR REPLACE FUNCTION public.validate_order_limit()
RETURNS trigger AS $$
DECLARE
    today_total NUMERIC;
    monthly_total NUMERIC;
    client_daily_limit NUMERIC;
    client_monthly_limit NUMERIC;
BEGIN
    -- Get client's limits
    SELECT daily_limit, monthly_limit INTO client_daily_limit, client_monthly_limit
    FROM public.clients
    WHERE id = NEW.client_id;

    -- Calculate today's total for approved orders
    SELECT COALESCE(SUM(amount), 0) INTO today_total
    FROM public.orders
    WHERE client_id = NEW.client_id
      AND status = 'APPROVED'
      AND created_at >= date_trunc('day', now());

    -- Calculate monthly total for approved orders
    SELECT COALESCE(SUM(amount), 0) INTO monthly_total
    FROM public.orders
    WHERE client_id = NEW.client_id
      AND status = 'APPROVED'
      AND created_at >= date_trunc('month', now());

    -- Validate Daily Limit
    IF (today_total + NEW.amount) > client_daily_limit THEN
        RAISE EXCEPTION 'Daily credit limit exceeded. Current total today: %, Limit: %, Requested: %', today_total, client_daily_limit, NEW.amount;
    END IF;

    -- Validate Monthly Limit
    IF (monthly_total + NEW.amount) > client_monthly_limit THEN
        RAISE EXCEPTION 'Monthly credit limit exceeded. Current total this month: %, Limit: %, Requested: %', monthly_total, client_monthly_limit, NEW.amount;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate order before insertion
CREATE OR REPLACE TRIGGER before_order_insert
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.validate_order_limit();
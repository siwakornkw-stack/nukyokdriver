-- Allow a DriverJob to exist without an assigned driver (status 'unassigned'),
-- so dispatchers can create the job first and pick the driver later.
ALTER TABLE "DriverJob" ALTER COLUMN "VehicleDriverId" DROP NOT NULL;

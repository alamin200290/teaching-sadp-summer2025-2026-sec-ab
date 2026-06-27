import { DriverRepository } from "../drivers/DriverRepository";
import { Driver } from "../drivers/Driver";
import { Car, Motorbike, Rickshaw } from "../drivers/Vehicle";
import { Location } from "../shared/Location";
export function seedDemoDrivers(repo: DriverRepository): void {
  repo.save(new Driver("drv_01", "Rahim", new Car(), new Location(23.8223, 90.4265, "Kuratoli")));
  repo.save(new Driver("drv_02", "Karim", new Motorbike(), new Location(23.8198, 90.4242, "AIUB Gate")));
  repo.save(new Driver("drv_03", "Shila", new Rickshaw(), new Location(23.8245, 90.4288, "Jamuna FC")));
}

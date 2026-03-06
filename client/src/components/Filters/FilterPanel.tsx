import { NafSearch } from './NafSearch';
import { LocationSearch } from './LocationSearch';
import { RadiusSlider } from './RadiusSlider';
import { ActiveFilters } from './ActiveFilters';
import { DisplayModeToggle } from './DisplayModeToggle';

export function FilterPanel() {
  return (
    <div className="p-4 space-y-4">
      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Industry (NAF Code)</h3>
        <NafSearch />
      </section>

      <ActiveFilters />

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
        <LocationSearch />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Coverage Radius</h3>
        <RadiusSlider />
      </section>

      <section>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Display Mode</h3>
        <DisplayModeToggle />
      </section>
    </div>
  );
}

import { createSignal, createEffect, Show, For } from "solid-js";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isBefore,
} from "date-fns";
import { es } from "date-fns/locale";

function DateRangePicker(props) {
  const [showPicker, setShowPicker] = createSignal(false);
  const [currentMonth, setCurrentMonth] = createSignal(new Date());
  const [tempStartDate, setTempStartDate] = createSignal(null);
  const [tempEndDate, setTempEndDate] = createSignal(null);

  // Sincronizar con props cuando se abre el picker
  createEffect(() => {
    if (showPicker()) {
      setTempStartDate(props.startDate || null);
      setTempEndDate(props.endDate || null);
    }
  });

  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  const getMonthDays = (date) => {
    const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const handleDayClick = (day) => {
    const currentStart = tempStartDate();
    const currentEnd = tempEndDate();

    // Si ya hay un rango completo, resetear y empezar de nuevo
    if (currentStart && currentEnd) {
      setTempStartDate(day);
      setTempEndDate(null);
      return;
    }

    // Si no hay inicio, establecer inicio
    if (!currentStart) {
      setTempStartDate(day);
      setTempEndDate(null);
      return;
    }

    // Si hay inicio pero no fin
    if (currentStart && !currentEnd) {
      if (isBefore(day, currentStart)) {
        // Si selecciona fecha anterior, hacer SWAP
        setTempEndDate(currentStart);
        setTempStartDate(day);
      } else {
        // Si selecciona fecha posterior, establecer como fin
        setTempEndDate(day);
      }
    }
  };

  const isDayInRange = (day) => {
    const start = tempStartDate();
    const end = tempEndDate();
    if (!start || !end) return false;
    return isWithinInterval(day, { start, end });
  };

  const isDayStart = (day) => {
    const start = tempStartDate();
    return start && isSameDay(day, start);
  };

  const isDayEnd = (day) => {
    const end = tempEndDate();
    return end && isSameDay(day, end);
  };

  const applyDateRange = () => {
    const start = tempStartDate();
    const end = tempEndDate();
    
    if (start && end) {
      props.onDateChange({
        startDate: start,
        endDate: end,
      });
      setShowPicker(false);
      if (props.onApply) props.onApply();
    }
  };

  const clearDates = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    props.onDateChange({ startDate: null, endDate: null });
    setShowPicker(false);
  };

  const applyPreset = (preset) => {
    const today = new Date();
    let start, end;

    switch (preset) {
      case "today":
        start = today;
        end = today;
        break;
      case "week":
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case "month":
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = today;
        break;
    }

    setTempStartDate(start);
    setTempEndDate(end);
    props.onDateChange({ startDate: start, endDate: end });
    setShowPicker(false);
    if (props.onApply) props.onApply();
  };

  const formatRange = () => {
    if (!props.startDate && !props.endDate)
      return "Seleccionar rango de fechas";
    if (props.startDate && !props.endDate)
      return `Desde ${format(props.startDate, "dd/MM/yyyy", { locale: es })}`;
    if (props.startDate && props.endDate) {
      return `${format(props.startDate, "dd/MM/yyyy", { locale: es })} - ${format(props.endDate, "dd/MM/yyyy", { locale: es })}`;
    }
    return "Seleccionar rango";
  };

  const getSelectionMessage = () => {
    const start = tempStartDate();
    const end = tempEndDate();
    
    if (!start) {
      return "📍 Selecciona fecha de inicio";
    } else if (!end) {
      return "📍 Selecciona fecha de fin";
    } else {
      return "✅ Aplicar o selecciona nuevas fechas";
    }
  };

  return (
    <div class="relative">
      <button
        type="button"
        onClick={() => setShowPicker(!showPicker())}
        class="input-field w-full text-left flex items-center justify-between gap-2"
      >
        <span
          class={
            props.startDate ? "text-gray-900 dark:text-white" : "text-gray-400"
          }
        >
          {formatRange()}
        </span>
        <span class="text-gray-400">📅</span>
      </button>

      <Show when={showPicker()}>
        <div
          class="absolute top-full left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 
                    rounded-xl shadow-xl z-50 p-4 min-w-[320px]"
        >
          {/* Presets */}
          <div class="flex gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={() => applyPreset("today")}
              class="text-xs px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => applyPreset("week")}
              class="text-xs px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Última semana
            </button>
            <button
              type="button"
              onClick={() => applyPreset("month")}
              class="text-xs px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Último mes
            </button>
          </div>

          {/* Navegación */}
          <div class="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth(), 1))}
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              ◀
            </button>
            <span class="font-semibold text-sm text-gray-900 dark:text-white capitalize">
              {format(currentMonth(), "MMMM yyyy", { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth(), 1))}
              class="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              ▶
            </button>
          </div>

          {/* Días semana */}
          <div class="grid grid-cols-7 gap-1 mb-2">
            <For each={weekDays}>
              {(day) => (
                <div class="text-center text-xs font-semibold text-gray-500 dark:text-gray-400 py-1">
                  {day}
                </div>
              )}
            </For>
          </div>

          {/* Calendario */}
          <div class="grid grid-cols-7 gap-1">
            <For each={getMonthDays(currentMonth())}>
              {(day) => {
                const isCurrentMonth = isSameMonth(day, currentMonth());
                const isStart = isDayStart(day);
                const isEnd = isDayEnd(day);
                const isInRange = isDayInRange(day);

                return (
                  <button
                    type="button"
                    onClick={() => isCurrentMonth && handleDayClick(day)}
                    disabled={!isCurrentMonth}
                    class={`
                      p-2 text-xs rounded-md transition-colors
                      ${!isCurrentMonth ? "text-gray-300 dark:text-gray-700 cursor-not-allowed" : ""}
                      ${isCurrentMonth && !isInRange && !isStart && !isEnd ? "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800" : ""}
                      ${isInRange && !isStart && !isEnd ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400" : ""}
                      ${isStart || isEnd ? "bg-blue-600 text-white font-semibold" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </button>
                );
              }}
            </For>
          </div>

          {/* Footer */}
          <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {getSelectionMessage()}
            </p>

            <div class="flex gap-2">
              <button
                type="button"
                onClick={clearDates}
                class="btn-secondary flex-1 text-xs"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={applyDateRange}
                disabled={!tempStartDate() || !tempEndDate()}
                class="btn-primary flex-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
}

export default DateRangePicker;
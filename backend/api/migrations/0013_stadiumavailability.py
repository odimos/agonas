from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_tournament_fields_phase_is_open_teams'),
    ]

    operations = [
        migrations.CreateModel(
            name='StadiumAvailability',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('day', models.PositiveSmallIntegerField(choices=[(0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'), (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')])),
                ('start_time', models.TimeField()),
                ('end_time', models.TimeField()),
                ('quantity', models.PositiveSmallIntegerField(default=1)),
                ('stadium', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='availabilities', to='api.stadium')),
            ],
            options={
                'ordering': ['day', 'start_time'],
            },
        ),
    ]
